// BodyParser is specifically used to parse the POST response from Azure B2C/ADFS.
const bodyParser = require("body-parser")
// PassportJs handles authentication for us using the passport-azure-ad plug-in.
const passport = require("passport")
// Get the strategy we use to authenticate with Azure B2C and ADFS (it handles both for us)
const OIDCStrategy = require("passport-azure-ad").OIDCStrategy

const mergeConfig = require("../utils/mergeConfig")


// Small helper that ensures the policy query parameter is set.
// If you have links on the client that specify the p=[policy] query paramter this is not needed.
// We do this since we know which policy to use in all cases and wish to avoid hard coding this into links for the client.
const ensureSignInPolicyQueryParameter = (policyName) => (req, res, next) => {
	req.query.p = req.query.p || policyName
	next()
}

const authenticatorGet = (req, res, next) => {
	// Construct middleware that can perform authentication
	return passport.authenticate("veracity-oidc-data", { 
		response: res,
		failureRedirect: "/error", // Where to route the user if the authentication fails
		customState: req.query.location || ""
	})(req, res, next)
}

const authenticatorPost = (req, res, next) => {
	// Construct middleware that can perform authentication
	return passport.authenticate("veracity-oidc-data", { 
		response: res,
		failureRedirect: "/error", // Where to route the user if the authentication fails
	})(req, res, next)
}


const verifier = (req, iss, sub, profile, jwtClaims, access_token, refresh_token, params, done) => {
	const user = req.user || {} // Extract information from the data returned from B2C/ADFS
	user.tokens.data = {
		access_token,
		refresh_token,
		container: {}
	}
	
	done(null, user) // Tell passport that no error occured (null) and which user object to store with the session.
}

module.exports = {
	setupStrategy: (config, passport) => {
		const dataConfig = mergeConfig({
			...config, 
			redirectUrl: "https://localhost:3000/signin-oidc/complete/azuread-b2c-oauth2/",
			scope: "https://dnvglb2cprod.onmicrosoft.com/37c59c8d-cd9d-4cd5-b05a-e67f1650ee14/user_impersonation",
		})

		const strategy = new OIDCStrategy(dataConfig.oidcConfig, verifier)
		passport.use("veracity-oidc-data", strategy)
	},

	setupEndpoints: (app, config) => {

		// Our login route. This is where the authentication magic happens.
		// We must ensure that the policy query parameter is set and we therefore include our small middleware before the actual login process.
		app.get("/login-data", ensureSignInPolicyQueryParameter(config.policyName), authenticatorGet, (req, res) => {
			res.redirect("/error") // This redirect will never be used unless something failed. The return-url when login is complete is configured as part of the application registration.
		})

		// This route is where we retrieve the authentication information posted back from Azure B2C/ADFS.
		// To perform the necessary steps it needs to parse post data as well as sign in correctly. This is done using the body-parser middleware.
		app.post("/signin-oidc/complete/azuread-b2c-oauth2/", bodyParser.urlencoded({extended: true}), authenticatorPost, (req, res) => {
			res.redirect(req.body.state)
		})
	}
}