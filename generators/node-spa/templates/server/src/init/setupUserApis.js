const request = require("request-promise-native")
const promiseRouteHandler = require("../utils/promiseRouteHandler")
const notAuthMiddleware = require("../utils/notAuthMiddleware")

module.exports = (app, authConfig) => {
	app.get("/_api/user", notAuthMiddleware, promiseRouteHandler( async (req, res, next) => {
		
		try {
			const response = await request({
				url: "https://api.veracity.com/Veracity/Services/V3/my/profile",
				headers: {
					"Ocp-Apim-Subscription-Key": authConfig.apiKeys.servicesApi, // Grab the subscription key for the Services API
					Authorization: "Bearer " + req.user.tokens.services.access_token, // And the access token to authorize the request
				}
			})
			res.send(response)

		} catch(error) {
			res.response(error)
		}

	}))

}