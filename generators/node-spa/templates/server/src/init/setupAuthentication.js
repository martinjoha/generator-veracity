// ExpressSession is used to store session info in memory so the user does not have to re-authenticate on every request.
const expressSession = require("express-session")
// BodyParser is specifically used to parse the POST response from Azure B2C/ADFS.
const bodyParser = require("body-parser")
// PassportJs handles authentication for us using the passport-azure-ad plug-in.
const passport = require("passport")
// Get the strategy we use to authenticate with Azure B2C and ADFS (it handles both for us)
const OIDCStrategy = require("passport-azure-ad").OIDCStrategy

const mergeAuthConfig = (authConfig) => ({
	// The options we must pass to OpenID Connect. See https://github.com/AzureAD/passport-azure-ad
	oidcConfig: {
		identityMetadata: `https://login.microsoftonline.com/${authConfig.tenantID}/v2.0/.well-known/openid-configuration`,

		clientID: authConfig.clientID,
		clientSecret: authConfig.clientSecret,

		isB2C: true,
		passReqToCallback: true,
		loggingLevel: "info",
		scope: [
			"openid", // Request the identity token
			"offline_access", // Request the refresh token so we can refresh if the access token times out
			authConfig.scope // Add the scope for the access token from the configuration settings
		],

		responseType: "code",
		responseMode: "form_post", // How the authentication server will respond back when authentication is complete. 'form_post' is required by Azure B2C.
		redirectUrl: authConfig.redirectUrl, // The url where authentication data is returned from B2C/ADFS. This MUST match the configured return url from when the application was registered.
		allowHttpForRedirectUrl: false // Prevent using HTTP for redirects. This forces use of HTTPS for all urls and is the safer method.
	},
	
	// We need this option to perform the login request properly.
	policyName: authConfig.policyName,

	// The url we must use to log out properly and also destroy any session cookies.
	// We use the parameter 'post_logout_redirect_uri' to route users back to our application in order to finish the log out process on our end.
	// A route matching this url is set up in start.js to handle the final steps of the sign out process.
	destroySessionUrl: `https://login.microsoftonline.com/${authConfig.tenantID}/oauth2/v2.0/logout?p=${authConfig.policyName}&post_logout_redirect_uri=https://localhost:3000/logoutadfs`,

	// In order to complete the sign-out process ADFS needs to clear its session data as well. That is done by visiting this url.
	destroyADFSSessionUrl: "https://fsext1.dnv.com/adfs/ls/?wa=wsignout1.0",
})

// Small helper that ensures the policy query parameter is set.
// If you have links on the client that specify the p=[policy] query paramter this is not needed.
// We do this since we know which policy to use in all cases and wish to avoid hard coding this into links for the client.
const ensureSignInPolicyQueryParameter = (policyName) => (req, res, next) => {
	req.query.p = req.query.p || policyName
	next()
}
// Helper that will perform the authentication against B2C/ADFS.
const authenticator = (req, res, next) => {
	// Construct middleware that can perform authentication
	return passport.authenticate("veracity-oidc", { 
		response: res,
		failureRedirect: "/error" // Where to route the user if the authentication fails
	})(req, res, next)
}

const verifier = (iss, sub, profile, jwtClaims, access_token, refresh_token, params, done) => {
	const user = { // Extract information from the data returned from B2C/ADFS
		name: jwtClaims.name,
		id: jwtClaims.oid,
		displayName: profile.displayName,

		tokens: {
			services: {
				access_token,
				refresh_token
			}
		}
	}

	done(null, user) // Tell passport that no error occured (null) and which user object to store with the session.
}

module.exports = (app, authConfig, log) => {
	log.debug("Configuring session")
	// Set up session support for requests
	app.use(expressSession({
		secret: "session secret", // The key phrase used to sign session cookies.
		resave: false, // Prevent resaving session data if nothing was modified.
		saveUninitialized: false, // Only save sessions if they are actually initialized (i.e.: only save if the user is actually authenticated)
		cookie: {
			secure: true, // Set the https flag on the session cookie ensuring that it can only be sent over a secure (HTTPS) connection
			httpOnly: true
		},
		// store: // TODO: Setup proper session storage (https://github.com/expressjs/session#compatible-session-stores)
	}))

	const fullConfig = mergeAuthConfig(authConfig)

	log.debug("Setting up auth strategy")

	// Create and configure the strategy instance that will perform authentication
	const strategy = new OIDCStrategy(fullConfig.oidcConfig, verifier)
	// Register the strategy with passport
	passport.use("veracity-oidc", strategy)
	// Specify what information about the user should be stored in the session. Here we store the entire user object we define in the 'verifier' function.
	// You can pick only parts of it if you don't need all the information or if you have user information stored somewhere else.
	passport.serializeUser((user, done) => { done(null, user) })
	passport.deserializeUser((passportSession, done) => { done(null, passportSession) })

	log.debug("Connecting passport to application")

	//Now that passport is configured we need to tell express to use it
	app.use(passport.initialize()) // Register passport with our expressjs instance
	app.use(passport.session()) // We are using sessions to persist the login and must therefore also register the session middleware from passport.

	// Our login route. This is where the authentication magic happens.
	// We must ensure that the policy query parameter is set and we therefore include our small middleware before the actual login process.
	app.get("/login", ensureSignInPolicyQueryParameter(fullConfig.policyName), authenticator, (req, res) => {
		res.redirect("/error") // This redirect will never be used unless something failed. The return-url when login is complete is configured as part of the application registration.
	})
	// This route is where we retrieve the authentication information posted back from Azure B2C/ADFS.
	// To perform the necessary steps it needs to parse post data as well as sign in correctly. This is done using the body-parser middleware.
	app.post("/signin-oidc", bodyParser.urlencoded({ extended: true }), authenticator, (req, res) => {
		res.redirect("/")
	})
	// Our logout route handles logging out of B2C and removing session information.
	app.get("/logout", (req, res) => { // Overview step 8
		// First we instruct the session manager (express-session) to destroy the session information for this user.
		req.session.destroy(() => {
			// Then we call the logout function placed on the req object by passport to sign out of Azure B2C
			req.logout()
			// Finally we redirect to Azure B2C to destroy the session information. This will route the user to the /logoutadfs route when done.
			res.redirect(fullConfig.destroySessionUrl)
		})
	})
	app.get("/logoutadfs", (req, res) => {
		res.redirect("/")
	})
}