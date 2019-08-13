// BodyParser is specifically used to parse the POST response from Azure B2C/ADFS.
const bodyParser = require("body-parser")
// Get the strategy we use to authenticate with Azure B2C and ADFS (it handles both for us)
const OIDCStrategy = require("passport-azure-ad").OIDCStrategy
// Helper for creating the strategy and enrire
const mergeConfig = require("../utils/mergeConfig")
const passport = require("passport")


const verifier = (iss, sub, profile, jwtClaims, access_token, refresh_token, params, done) => {
	const	user = { // Extract information from the data returned from B2C/ADFS
		name: jwtClaims.name,
		id: jwtClaims.oid,
		displayName: profile.displayName,
		tokens: {
			services: {
				access_token,
				refresh_token
			},
				
		}
	}

	done(null, user) // Tell passport that no error occured (null) and which user object to store with the session.
}

// Small helper that ensures the policy query parameter is set.
// If you have links on the client that specify the p=[policy] query paramter this is not needed.
// We do this since we know which policy to use in all cases and wish to avoid hard coding this into links for the client.
const ensureSignInPolicyQueryParameter = (policyName) => (req, res, next) => {
	req.query.p = req.query.p || policyName

	next()
}


// Helper that will perform the authentication against B2C/ADFS.
const authenticatorGet = (req, res, next) => {
	// Construct middleware that can perform authentication
	return passport.authenticate("veracity-oidc", { 
		response: res,
		failureRedirect: "/error", // Where to route the user if the authentication fails
		customState: "/" + (req.query.location || "")
	})(req, res, next)
}

const authenticatorPost = (req, res, next) => {
	// Construct middleware that can perform authentication
	return passport.authenticate("veracity-oidc", { 
		response: res,
		failureRedirect: "/error", // Where to route the user if the authentication fails
	})(req, res, next)
}

module.exports = {
	setupStrategy: (config, passport) => {
		const authConfig = mergeConfig(config)
		
		// Create and configure the strategy instance that will perform authentication
		const strategy = new OIDCStrategy(authConfig.oidcConfig, verifier)
		
		passport.use("veracity-oidc", strategy)
	},

	setupEndpoints: (app, config) => {
		// Our login route. This is where the authentication magic happens.
		// We must ensure that the policy query parameter is set and we therefore include our small middleware before the actual login process.
		app.get("/login", ensureSignInPolicyQueryParameter(config.policyName), authenticatorGet, (req, res) => {
			res.redirect("/error") // This redirect will never be used unless something failed. The return-url when login is complete is configured as part of the application registration.
		})
		
		// This route is where we retrieve the authentication information posted back from Azure B2C/ADFS.
		// To perform the necessary steps it needs to parse post data as well as sign in correctly. This is done using the body-parser middleware.
		// Make sure the url is one of the urls from your developer.veracity.com links
		app.post("/signin-oidc", bodyParser.urlencoded({ extended: true }), authenticatorPost, (req, res) => {
			res.redirect("/login-data?location=" + req.body.state)
		})
	},
}