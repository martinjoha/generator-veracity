//-----------------------------------------------------------------------------
// This file configures the server to support authentication for Veracity APIs
// and requests the access token needed to perform requests.
//-----------------------------------------------------------------------------


// Import our server setup code so that we can configure authentication on our server instance.
const {app, readIndexFileAndSetState, start} = require('./server.js');
// Fetch authentication configuration
const {authConfig} = require('./config.js');

// ExpressSession is used to store session info in memory so the user does not have to re-authenticate on every request.
const expressSession = require('express-session');
// BodyParser is specifically used to parse the POST response from Azure B2C/ADFS.
const bodyParser = require('body-parser');
// PassportJs handles authentication for us using the passport-azure-ad plug-in.
const passport = require('passport');
// Get the strategy we use to authenticate with Azure B2C and ADFS (it handles both for us)
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
// Helper library for performing http requests from node.js. Used to query the Veracity API from the server on behalf of the user.
const request = require('request-promise-native');


//-----------------------------------------------------------------------------
// Set up our session manager that will use in-memory storage for sessions. You should not use in-memory storage in production.
// This must be done before we attach the passport middleware or passport will be unable to use sessions
// For a full description of these options see https://github.com/expressjs/session
//-----------------------------------------------------------------------------
app.use(expressSession({
  secret: 'session secret', // The key phrase used to sign session cookies.
  resave: false, // Prevent resaving session data if nothing was modified.
  saveUninitialized: false, // Only save sessions if they are actually initialized (i.e.: only save if the user is actually authenticated)
  cookie: {
    secure: true // Set the https flag on the session cookie ensuring that it can only be sent over a secure (HTTPS) connection
  }
}));


//-----------------------------------------------------------------------------
// Now we can set up our authentication details
//-----------------------------------------------------------------------------
const verifier = function(iss, sub, profile, jwtClaims, access_token, refresh_token, params, done){
  const user = { // Extract information from the data returned from B2C/ADFS
    name: jwtClaims.name,
    id: jwtClaims.oid,
    displayName: profile.displayName,

    // make sure we store the access token
    access_token: params.access_token
  };

  done(null, user); // Tell passport that no error occured (null) and which user object to store with the session.
};
// Create and configure the strategy instance that will perform authentication
const authenticationStrategy = new OIDCStrategy(authConfig.oidcOptions, verifier);

// Register the strategy with passport
passport.use('azuread-openidconnect', authenticationStrategy);

// Specify what information about the user should be stored in the session. Here we store the entire user object we define in the 'verifier' function.
// You can pick only parts of it if you don't need all the information or if you have user information stored somewhere else.
passport.serializeUser((user, done) => { done(null, user); });
passport.deserializeUser((passportSession, done) => { done(null, passportSession); });

//Now that passport is configured we need to tell express to use it
app.use(passport.initialize()); // Register passport with our expressjs instance
app.use(passport.session()); // We are using sessions to persist the login and must therefore also register the session middleware from passport.

// Finally we create some helper functions to simplify routing.
// Helper that will perform the authentication against B2C/ADFS.
const authenticator = res => {
  // Construct middleware that can perform authentication
  return passport.authenticate('azuread-openidconnect', { 
    response: res,
    failureRedirect: '/error' // Where to route the user if the authentication fails
  });
};
// Helper middleware that will verify that the user is authenticated and if not perform authentication.
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()){
    return next(); // User is authenticated, simply pass control to the next route handler.
  }
  res.redirect('/login'); // User is not authenticated, redirect to our /login route that will perform authentication (see below).
};
// Small helper that ensures the policy query parameter is set.
// If you have links on the client that specify the p=[policy] query paramter this is not needed.
// We do this since we know which policy to use in all cases and wish to avoid hard coding this into links for the client.
const ensureSignInPolicyQueryParameter = (req, res, next) => {
  req.query.p = req.query.p || authConfig.policyName;
  next();
}


//-----------------------------------------------------------------------------
// Now that all our helper and initialization stuff is ready we can set up the routes our app will respond to.
//-----------------------------------------------------------------------------
// Our home route. Returns index.html and sets the user state if the user is logged in (req.user will be undefined of not authenticated).
app.get('/', (req, res) => {
  res.render('index', {user: req.user}); // Render the index view
});

// This route is where we retrieve the authentication information posted back from Azure B2C/ADFS.
// To perform the necessary steps it needs to parse post data as well as sign in correctly. This is done using the body-parser middleware.
app.post('/', bodyParser.urlencoded({extended: true}));
// After registering the body-parser middleware for this specific route (namely 'POST /'). We can apply our authenticator to read the POSTed information.
app.post('/', (req, res, next) => { // Overview step 4
  authenticator(res)(req, res, next);
}, (req, res) => {
  // Finally we redirect back to the front page, but this time the req.user parameter will be populated because we are signed in.
  res.redirect('/');
});

// Our login route. This is where the authentication magic happens.
// We must ensure that the policy query parameter is set and we therefore include our small middleware before the actual login process.
app.get('/login', ensureSignInPolicyQueryParameter, (req, res, next) => { // Overview step 2
  authenticator(res)(req, res, next); // Add our authenticator middleware helper to handle the authentication.
}, (req, res) => {
  res.redirect('/error'); // This redirect will never be used unless something failed. The return-url when login is complete is configured as part of the application registration.
});

// Our logout route handles logging out of B2C and removing session information.
app.get('/logout', (req, res, next) => { // Overview step 8
  // First we instruct the session manager (express-session) to destroy the session information for this user.
  req.session.destroy((err) => {
    // Then we call the logout function placed on the req object by passport to sign out of Azure B2C
    req.logout();
    // Finally we redirect to Azure B2C to destroy the session information. This will route the user to the /logoutadfs route when done.
    res.redirect(authConfig.destroySessionUrl);
  });
});
// This route handles the final step of the logout process. Deleting the session cookies set by ADFS in a manner that is not blocked by common browser security settings.
// Note that this will end the users session on a "Signed out" page generated by ADFS and will not return them to your application, but it is required to finish the logout process.
app.get('/logoutadfs', (req, res, next) => { // Overview step 9
  res.redirect(authConfig.destroyADFSSessionUrl); // Finally redirect the user to the ADFS log out page.
});


//-----------------------------------------------------------------------------
// Set up some example routes to test performing requests to the Veracity API.
//-----------------------------------------------------------------------------
// This route returns information about the current user by calling the Service API endpoint /my/profile
// Note that we chain our handlers with 'ensureAuthenticated' in order to ensure the user has signed in.
// If the user has not signed in that function will redirect them to the login page automatically.
app.get('/me', ensureAuthenticated, (req, res) => {
  const url = authConfig.veracityApiEndpoint + '/my/profile'; // Build the complete url for our request.
  request({ // Configure and initiate the request.
    url,
    headers: {
      'Accept': 'application/json', // Instruct the API that we want JSON data back.
      'Ocp-Apim-Subscription-Key': authConfig.veracityServiceApiKey, // Add the subscription key for the Veracity Services API
      'Authorization': 'Bearer '+req.user.access_token // Fetch the access token for the user and embed it in the request. Without this we will not be allowed to perform the request.
    }
  }).then(result => {
    res.render('me', { // Render the result of the call as readable JSON.
      result: JSON.stringify(JSON.parse(result), null, 2) // We do parse->stringify just to make it a bit more readable.
    });
  }).catch(error => { // In case of error display all information to the user (NOT SECURE!!!)
    res.status(500).render('error', {
      error: JSON.stringify(error, null, 2)
    });
  });
});

// This route returns information about my services
app.get('/services', ensureAuthenticated, (req, res) => {
  const url = authConfig.veracityApiEndpoint + '/my/services'; // Build the complete url for our request.
  request({ // Configure and initiate the request.
    url,
    headers: {
      'Accept': 'application/json', // Instruct the API that we want JSON data back.
      'Ocp-Apim-Subscription-Key': authConfig.veracityServiceApiKey, // Add the subscription key for the Veracity Services API
      'Authorization': 'Bearer '+req.user.access_token // Fetch the access token for the user and embed it in the request. Without this we will not be allowed to perform the request.
    }
  }).then(result => {
    res.render('me', { // Render the result of the call as readable JSON.
      result: JSON.stringify(JSON.parse(result), null, 2) // We do parse->stringify just to make it a bit more readable.
    });
  }).catch(error => { // In case of error display all information to the user (NOT SECURE!!!)
    res.status(500).render('error', {
      error: JSON.stringify(error, null, 2)
    });
  });
});


//-----------------------------------------------------------------------------
// Finally start our server by calling the start function from server.js
//-----------------------------------------------------------------------------
start();