const request = require("request-promise-native")
const azure = require("azure-storage")


const notAuthMiddleware = require("../utils/notAuthMiddleware")
const checkContainerMiddleware = require("../utils/checkContainerMiddleware")
const promiseRouteHandler = require("../utils/promiseRouteHandler")
const parseBlobs = require("../utils/parseBlobs")

module.exports = (app, config) => {
  
  
	// List the different containers you have access to
	app.get("/_api/containers", notAuthMiddleware, promiseRouteHandler( async (req, res) => {
		try {
			const response = await request({
				url: "https://api.veracity.com/veracity/datafabric/data/api/1/resources/",
				method: "GET",
				headers: {
					"Ocp-Apim-Subscription-Key": config.apiKeys.dataFabricApi,
					"Authorization": "Bearer " + req.user.tokens.data.access_token
				}
			})
			// Need to parse the data to store the container properties in the user object
			const data = await JSON.parse(response)
			res.send(data)
		} catch(error) {
			res.status(error.statusCode).send({ message: error.message })
		}
	}))

	app.get("/_api/container/listblobs", notAuthMiddleware, checkContainerMiddleware(config), promiseRouteHandler( async (req, res) => {
		try {
			const sharedBlobSvc = azure.createBlobServiceWithSas(req.user.tokens.data.container.containerUri, req.user.tokens.data.container.sasKey)
			sharedBlobSvc.listBlobsSegmented(req.user.tokens.data.container.containerName, null, (error, result) => {
				if(error) {
					res.status(error.statusCode).send({ message: error.message })
				} else{
					const parsedBlobs = parseBlobs(result.entries)
					res.send(parsedBlobs)
				}
			})
		} catch(error) {
			res.status(error.statusCode).send({ message: error.message })
		}
	}))

	app.get("/_api/container/blobproperties", notAuthMiddleware, checkContainerMiddleware(config), promiseRouteHandler( async (req, res) => {
		try {
			const { sasKey, containerUri, containerName } = req.user.tokens.data.container
			const sharedBlobSvc = await azure.createBlobServiceWithSas(containerUri, sasKey)
			sharedBlobSvc.getBlobProperties(
				containerName,
				req.headers.blobname,
				(error, result) => {
					if(error) {
						res.status(error.statusCode).send([{ name: req.headers.blobname, errorMessage: error.message }])
					} else {
						const parsedBlob = parseBlobs([result])
						res.send(parsedBlob)
					}
				}
			) 
		} catch(error) {
			res.status(error.statusCode).send({message: error.message})
		}
	}))

	app.get("/_api/container/blobcontent", notAuthMiddleware, checkContainerMiddleware(config), promiseRouteHandler( async (req, res) => {
		try {
			const { sasKey, containerUri, containerName } = req.user.tokens.data.container
			const sharedBlobSvc = await azure.createBlobServiceWithSas(containerUri, sasKey)
			sharedBlobSvc.getBlobToText(containerName, req.headers.blobname, (error, blobContent, blob) => {
				if(error) {
					res.status(error.statusCode).send({ blobName: req.headers.blobname, errorMessage: error.message })
				} else {
					res.send(blobContent)
				}
			})
		} catch(error) {
			res.status(error.statusCode).send({ message: error.message })
		}
	}))


	// Create a new blob for a given container
	app.get("/_api/container/createblob", notAuthMiddleware, promiseRouteHandler( async (req, res) => {
		try {
			const { sasKey, containerUri, containerName } = req.user.tokens.data.container
			const sharedBlobSvc = await azure.createBlobServiceWithSas(containerUri, sasKey)
			sharedBlobSvc.createAppendBlobFromText(
				containerName,
				req.headers.blobname,
				req.headers.blobtext,
				{ contentSettings: { contentType: req.headers. contenttype }},
				(error, result) => {
					if(error) {
						res.status(error.statusCode).send({ message: error.message })
					} else {
						res.send(result)
					}
				}
			) 
		} catch(error) {
			res.status(error.statusCode).send({ message: error.message })
		}
	}))


	app.get("/_api/container/deleteblob", notAuthMiddleware, promiseRouteHandler( async (req, res) => {
		try {
			const { sasKey, containerUri, containerName } = req.user.tokens.data.container
			const sharedBlobSvc = await azure.createBlobServiceWithSas(containerUri, sasKey)
			sharedBlobSvc.deleteBlob(containerName, req.headers.blobname, (error, result) => {
				if(error) {
					res.status(error.statusCode).send({ message: error.message })
				} else {
					res.send(result)
				}
			})
		} catch(error) {
			res.status(error.statusCode).send({ message: error.message })
		}
	}))


	app.post("/_api/container/appendtoblob", notAuthMiddleware, promiseRouteHandler( async (req, res, next) => {
		try {
			const { sasKey, containerUri, containerName } = req.user.tokens.data.container
			const sharedBlobSvc = await azure.createBlobServiceWithSas(containerUri, sasKey)
			const { blobname, text } = req.headers
			sharedBlobSvc.appendFromText(containerName, blobname, `\n${text}`, (error, result) => {
				if(error) {
					res.status(error.statusCode).send({ message: error.message })
				} else {
					res.send(result)
				}
			})
		} catch(error) {
			res.status(error.statusCode).send({ message: error.message })
		}
	}))

}