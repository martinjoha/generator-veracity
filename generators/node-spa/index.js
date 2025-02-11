const Generator = require("yeoman-generator")
const say = require("yosay")
const chalk = require("chalk")
const onlyAuthConfig = require("./onlyAuth.config")
const withDataFabricConfig = require("./withDataFabric.config")

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts)
	}

	initializing() {
		this.log(say(
`${chalk.bold.green("Veracity")}
${chalk.cyan(" Single-Page-Application")}
 Node`))
		this.log("Welcome! This generator will help you set up a framework for a Node based Single Page Web Application with the following features: ")
		this.log(
`- React/Redux front-end
- Client side routing
- Express powered backend
- Authentication with passport and passport-azure-ad
- Routes for logging in and logging out
- Development environment optimized for VisualStudio Code
`)
		this.log(chalk.bold(
`Before you begin you should register an application in a project on https://developer.veracity.com/
You will then be provided with the necessary parameters to authenticate with Veracity and access the APIs.

It is adviced to go through the documentation before starting the application.
`)
		)
	}
	async prompting() {
		this.answers = await this.prompt([
			{
				type: "input",
				name: "name",
				message: "Type your project name",
				default: this.appname
			},
			{
				type: "input",
				name: "clientId",
				message: "Type in your client Id if you have obtained one in the encrypted email",
				default: "[client id goes here]"
			},
			{
				type: "input",
				name: "clientSecret",
				message: "Type in your client Secret if you have obtained one in the encrypted email",
				default: "[ client secret goes here ]"
			},
			{
				type: "input",
				name: "servicesApiKey",
				message: "Type Ocp-Apim-Subscription-Key if you have obtained one in the encrypted email",
				defualt: "[ Ocp-Apim-Subscription-Key goes here ]"
			},
			{
				type: "confirm",
				name: "withDataFabric",
				message: "Will your application need access to Veracity data fabric?"
			}
		])
	}


	writing() {
		if(this.answers.withDataFabric) {
			this.fs.copyTpl(
				this.templatePath("./**"),
				this.destinationPath("./"),
				{
					...this.answers
				},
				null,
				{globOptions: {dot: true, ignore: withDataFabricConfig}}
			)
			
			
		} else {
			this.fs.copyTpl(
				this.templatePath("./**"),
				this.destinationPath("./"),
				{ 
					...this.answers
				},
				null,
				{globOptions: {dot: true, ignore: onlyAuthConfig}}
				)
				this.fs.copy(
					this.templatePath("./client/src/ducks/reducerWithOnlyAuth.js"),
					this.destinationPath("./client/src/ducks/index.js")
				)
				this.fs.copy(
					this.templatePath("./client/src/features/Header/HeaderWithoutDataFabric.js"),
					this.destinationPath("./client/src/features/Header/Header.js")
				)
				this.fs.copy(
					this.templatePath("./client/src/routes/routesWithoutDataFabric.js"),
					this.destinationPath("./client/src/routes/routes.js")
				)
				this.fs.copy(
					this.templatePath("./server/src/startWithoutDataFabric.js"),
					this.destinationPath("./server/src/start.js")
				)
				this.fs.copy(
					this.templatePath("./client/src/routes/indexWithoutDataFabric.js"),
					this.destinationPath("./client/src/routes/index.js")
				)
			
			}
		}

	/*async install() {
		if(this.answers.installDependencies){
			await this._private_method_install_server_dep()
			await this._private_method_install_client_dep()
		}
	}*/
}