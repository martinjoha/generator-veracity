const { MemoryStore } = require("express-session")
const { setupAuthFlowStrategy } = require("@veracity/node-auth/helpers")

module.exports = (app, config) => {
	const settings = {
		appOrRouter: app,
		loginPath: "/login",
		strategySettings: {
			clientId: config.clientID,
			clientSecret: config.clientSecret,
			replyUrl: "https://localhost:3000/signin-oidc",
			apiScopes: [
				"https://dnvglb2cprod.onmicrosoft.com/83054ebf-1d7b-43f5-82ad-b2bde84d7b75/user_impersonation",
				"https://dnvglb2cprod.onmicrosoft.com/37c59c8d-cd9d-4cd5-b05a-e67f1650ee14/user_impersonation"
			]
		},
		sessionSettings: {
			secret: "<%= secret %>",
			store: new MemoryStore()
		},
		onLoginComplete: (req, res) => {
			res.redirect(req.query.redirectTo || "/")
		}
	}
	setupAuthFlowStrategy(settings)
}