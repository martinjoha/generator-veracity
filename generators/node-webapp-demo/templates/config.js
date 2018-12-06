/**
 * This file contains all configuration options for the application.
 */


// Configuration for our server
const serverConfig = {
  // The port our application will be served from. This can be any valid port number as long as it is not in use.
  port: 3000,

  // The path where static assets like client side JavaScript are stored.
  staticPath: './client',

  // The paths to the certificate and key files we need to set up an HTTPS server.
  keyFile: './cert/key.pem',
  certFile: './cert/cert.pem'
};


//
// Authentication configuration for passport and Azure/ADFS:
//


// Normally you only need to alter these options:
const clientID = 'CLIENT ID'; // Your application ID that you get from https://developer.veracity.com when you create your application in My Projects.
const clientSecret = 'CLIENT SECRET'; // Your application secret that you received from https://developer.veracity.com when you create your application in My Projects.
const redirectUrl = 'https://localhost:3000/' // The redirect-url you registered with your application. Configure in Developerr portal




// 
// These settings usually do not change between applications.
//
const tenantID = 'a68572e3-63ce-4bc1-acdc-b64943502e9d'; // Veracity tenant ID
const policyName = 'B2C_1A_SignInWithADFSIdp'; // The policy to use when contacting Azure B2C

const authConfig = {
  // The options we must pass to OpenID Connect. See https://github.com/AzureAD/passport-azure-ad
  oidcOptions: {
    identityMetadata: `https://login.microsoftonline.com/${tenantID}/v2.0/.well-known/openid-configuration`,
    clientID,
    clientSecret,

    responseType: 'code',
    responseMode: 'form_post', // How the authentication server will respond back when authentication is complete. 'form_post' is required by Azure B2C.
    redirectUrl: redirectUrl, // The url where authentication data is returned from B2C/ADFS. This MUST match the configured return url from when the application was registered.
    allowHttpForRedirectUrl: false, // Prevent using HTTP for redirects. This forces use of HTTPS for all urls and is the safer method.

  // Which scopes we want to retrieve.
  scope: [
    'openid', // Perform OpenID Connect flow and returns the id_token.
    'https://dnvglb2cprod.onmicrosoft.com/83054ebf-1d7b-43f5-82ad-b2bde84d7b75/user_impersonation' // Request access token for Veracity API and returns the access_token.
  ],

    isB2C: true, // Required by Azure B2C.
    passReqToCallback: true, //If true will pass the express 'req' object to the strategy response function as the first argument.
    loggingLevel: 'info' // Enable logging of authentication flow.
  },

  // We need this option to perform the login request properly. See start.js
  policyName,

  // The url we must use to log out properly and also destroy any session cookies.
  // We use the parameter 'post_logout_redirect_uri' to route users back to our application in order to finish the log out process on our end.
  // A route matching this url is set up in start.js to handle the final steps of the sign out process.
  destroySessionUrl: `https://login.microsoftonline.com/${tenantID}/oauth2/v2.0/logout?p=${policyName}&post_logout_redirect_uri=https://localhost:3000/logoutadfs`,

  // In order to complete the sign-out process ADFS needs to clear its session data as well. That is done by visiting this url.
  destroyADFSSessionUrl: 'https://fsext1.dnv.com/adfs/ls/?wa=wsignout1.0', 
  

  // This is the starting point for the Veracity API. From here we can request information and perform actions.
  // See https://developer.veracity.com/doc/service-api
  veracityApiEndpoint: 'https://myapiv3.dnvgl.com' //
};

// Export our configuration objects
module.exports = {
  serverConfig, authConfig
};