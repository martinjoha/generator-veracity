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