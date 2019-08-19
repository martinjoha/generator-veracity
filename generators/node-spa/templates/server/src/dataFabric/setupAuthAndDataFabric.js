// ExpressSession is used to store session info in memory so the user does not have to re-authenticate on every request.
const expressSession = require("express-session")
// BodyParser is specifically used to parse the POST response from Azure B2C/ADFS.
const bodyParser = require("body-parser")
// PassportJs handles authentication for us using the passport-azure-ad plug-in.
const passport = require("passport")
// Get the strategy we use to authenticate with Azure B2C and ADFS (it handles both for us)

const setupAuthentication = require("./setupUserAuthentication")
const setupDataFabric = require("./setupDataFabricAuthentication")

module.exports = (app, config, log) => {

	const destroySessionUrl = `https://login.microsoftonline.com/${config.tenantID}/oauth2/v2.0/logout?p=${config.policyName}&post_logout_redirect_uri=https://localhost:3000/logoutadfs`

	log.debug("Configuring session")
	// Set up session support for requests
	app.use(expressSession({
		secret: "session secret", // The key phrase used to sign session cookies.
		resave: false, // Prevent resaving session data if nothing was modified.
		saveUninitialized: false, // Only save sessions if they are actually initialized (i.e.: only save if the user is actually authenticated)
		cookie: {
			secure: true, // Set the https flag on the session cookie ensuring that it can only be sent over a secure (HTTPS) connection
			httpOnly: true, // Set the httpOnly flag to ensure that the session id will not be accessible to client-side scripts
		},
		// store: // TODO: Setup proper session storage (https://github.com/expressjs/session#compatible-session-stores)
	}))

	log.debug("Setting up auth strategies")

	setupAuthentication.setupStrategy(config, passport)
	setupDataFabric.setupStrategy(config, passport)

	// Specify what information about the user should be stored in the session. Here we store the entire user object we define in the 'verifier' function.
	// You can pick only parts of it if you don't need all the information or if you have user information stored somewhere else.
	passport.serializeUser((user, done) => { done(null, user) })
	passport.deserializeUser((passportSession, done) => { done(null, passportSession) })

	log.debug("Connecting passport to application")

	//Now that passport is configured we need to tell express to use it
	app.use(passport.initialize()) // Register passport with our expressjs instance
	app.use(passport.session()) // We are using sessions to persist the login and must therefore also register the session middleware from passport.

	log.debug("Setting up endpoints")

	// Simple module functions to set up the authentication endpoints for both user authentication and data fabric
	setupAuthentication.setupEndpoints(app, config)
	setupDataFabric.setupEndpoints(app, config)

	// Our logout route handles logging out of B2C and removing session information.
	app.get("/logout", (req, res) => { // Overview step 8
		// First we instruct the session manager (express-session) to destroy the session information for this user.
		req.session.destroy(() => {
			// Then we call the logout function placed on the req object by passport to sign out of Azure B2C
			req.logout()
			// Finally we redirect to Azure B2C to destroy the session information. This will route the user to the /logoutadfs route when done.
			res.redirect(destroySessionUrl)
		})
	})
	app.get("/logoutadfs", (req, res) => {
		res.redirect("/")
	})

}