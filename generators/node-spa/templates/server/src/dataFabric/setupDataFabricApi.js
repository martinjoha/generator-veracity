const request = require("request-promise-native")
const azure = require("azure-storage")


const notAuthMiddleware = require("../utils/notAuthMiddleware")
const checkContainerMiddleware = require("../utils/checkContainerMiddleware")
const promiseRouteHandler = require("../utils/promiseRouteHandler")

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
					const parsedBlobs = result.entries.map(blob => {
						const {containerUri, containerName, sasKey} = req.user.tokens.data.container
						return {
							name: blob.name,
							blobType: blob.blobType,
							lastModified: blob.lastModified,
							creationTime: blob.creationTime,
							contentType: blob.contentSettings.contentType,
							url: `${containerUri}/${containerName}/${blob.name}${sasKey}`				
						}	
					})
					
					res.send(parsedBlobs)
				}
			})
		} catch(error) {
			res.status(error.statusCode).send({ message: error.message })
		}
	}))

	
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

}
