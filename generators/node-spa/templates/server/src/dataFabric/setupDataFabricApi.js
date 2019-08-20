const request = require("request-promise-native")
const azure = require("azure-storage")


const notAuthMiddleware = require("../utils/notAuthMiddleware")
const checkContainerMiddleware = require("../utils/checkContainerMiddleware")
const promiseRouteHandler = require("../utils/promiseRouteHandler")

const { dataFabric } = require("../config/scopes")


module.exports = (app, config) => {
  
  
	// List the different containers you have access to
	app.get("/_api/containers", notAuthMiddleware, promiseRouteHandler( async (req, res) => {
		try {
			const response = await request({
				url: "https://api.veracity.com/veracity/datafabric/data/api/1/resources/",
				method: "GET",
				headers: {
					"Ocp-Apim-Subscription-Key": config.apiKeys.dataFabricApi,
					"Authorization": "Bearer " + req.user.apiTokens[dataFabric].accessToken
				}
			})
			const data = await JSON.parse(response)
			res.send(data)
		} catch(error) {
			next(error)
		}
	}))
	
	app.get("/_api/container/listblobs", notAuthMiddleware, checkContainerMiddleware(config), promiseRouteHandler( async (req, res, next) => {
		try {
			const sharedBlobSvc = await azure.createBlobServiceWithSas(req.user.container.containerUri, req.user.container.sasKey)
			sharedBlobSvc.listBlobsSegmented(req.user.container.containerName, null, (error, result) => {
				if(error) {
					next(error)
				} else{
					const {containerUri, containerName, sasKey} = req.user.container
					const parsedBlobs = result.entries.map(blob => ({
						name: blob.name,
						blobType: blob.blobType,
						lastModified: blob.lastModified,
						creationTime: blob.creationTime,
						contentType: blob.contentSettings.contentType,
						url: `${containerUri}/${containerName}/${blob.name}${sasKey}`				
					}))
					res.send(parsedBlobs)
				}
			})
		} catch(error) {
			next(error)
			//res.status(error.statusCode).send({ message: error.message })
		}
	}))

	
	app.get("/_api/container/createblob", notAuthMiddleware, checkContainerMiddleware(config), promiseRouteHandler( async (req, res) => {
		try {
			const { sasKey, containerUri, containerName } = req.user.container
			const sharedBlobSvc = await azure.createBlobServiceWithSas(containerUri, sasKey)
			sharedBlobSvc.createAppendBlobFromText(
				containerName,
				req.headers.blobname,
				req.headers.blobtext,
				{ contentSettings: { contentType: req.headers. contenttype }},
				(error, result) => {
					if(error) {
						next(error)
					} else {
						res.send(result)
					}
				}
			) 
		} catch(error) {
			next(error)
		}
	}))


	app.get("/_api/container/deleteblob", notAuthMiddleware, checkContainerMiddleware(config), promiseRouteHandler( async (req, res) => {
		try {
			const { sasKey, containerUri, containerName } = req.user.container
			const sharedBlobSvc = await azure.createBlobServiceWithSas(containerUri, sasKey)
			sharedBlobSvc.deleteBlob(containerName, req.headers.blobname, (error, result) => {
				if(error) {
					next(error)
				} else {
					res.send(result)
				}
			})
		} catch(error) {
			next(error)
		}
	}))

}
