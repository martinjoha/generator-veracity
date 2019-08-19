module.exports = (authConfig) => {

	return {
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
	}
}