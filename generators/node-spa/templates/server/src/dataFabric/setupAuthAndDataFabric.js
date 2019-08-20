const { MemoryStore } = require("express-session")
const { setupAuthFlowStrategy } = require("@veracity/node-auth/helpers")

module.exports = (app) => {
	const settings = {
		appOrRouter: app,
		loginPath: "/login",
		strategySettings: {
			clientId: "b6ada6f6-60bc-4750-9db7-6025efa0d6af",
			clientSecret: ";Uk(&a:33B1AIgdpaq[0ry~G",
			replyUrl: "https://localhost:3000/signin-oidc",
			apiScopes: [
				"https://dnvglb2cprod.onmicrosoft.com/83054ebf-1d7b-43f5-82ad-b2bde84d7b75/user_impersonation",
				"https://dnvglb2cprod.onmicrosoft.com/37c59c8d-cd9d-4cd5-b05a-e67f1650ee14/user_impersonation"
			]
		},
		sessionSettings: {
			secret: "66530082-b48b-41f1-abf5-0987eb156652",
			store: new MemoryStore()
		},
		onLoginComplete: (req, res) => {
			res.redirect(req.query.redirectTo || "/")
		}
	}
	setupAuthFlowStrategy(settings)
}