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