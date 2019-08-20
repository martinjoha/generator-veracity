const app = require("express")() // Import express web server and create an app instance
const configLoader = require("./config")
const parseError = require("./utils/parseError")

const setupLogger = require("./init/setupLogging")
const setupAuthentication = require("./init/setupAuthentication")
const setupUserApis = require("./init/setupUserApis")
const setupRoutes = require("./init/setupRoutes")
const setupServer = require("./init/setupServer")


const start = async () => {
	let log = undefined
	let config = undefined
	const prestart = async () => {
		config = await configLoader()
		log = setupLogger(config.server.logDir)
		if (!config.auth.clientID || !config.auth.clientSecret) {
			throw new Error("You MUST specify the client id and client secret in the configuration file before your code can run.")
		}
	}
	await prestart().catch(error => {
		// eslint-disable-next-line no-console
		console.error(error)
		process.exit(1)
	})

	const startAsync = async () => {
		log.info("Application starting")

		app.set("trust proxy", true) // Ensures that proxy servers such as those employed by Azure AppServices still result in a trusted secure connection
		app.set("etag", false) // Disable etags to prevent overzealous caching


		await setupAuthentication(app)

		setupUserApis(app, config.auth)
		// Do this last as it adds a generic route handler
		setupRoutes(app, config.server.staticRoot, log)

		await setupServer(app, log, config.server)
	}
	startAsync().catch(error => {
		log.error(parseError(error))
		process.exit(1)
	})
}
start()