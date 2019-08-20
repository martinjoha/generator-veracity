const request = require("request-promise-native")
const { dataFabric } = require("../config/scopes")

// Middleware for checking if the SAS-token exists or we are asking for a different container than in memory, will generate the correct one if not
// Since we assume the container ID is available, getting the SAS-token requires two calls to the Veracity API.

module.exports = config => async (req, res, next) => {
	const container = req.user.container || {}
	if(req.headers.id === container.id) { // We already have the correct data for the container, and do not need to ask again.
		next()
	} else {
		try {
			const accesses = await request({ // Getting all the accesses a user has to a container, and assume the first one is still valid
				url: `https://api.veracity.com/veracity/datafabric/data/api/1/resources/${req.headers.id}/accesses`,
				headers: {
					"Ocp-Apim-Subscription-Key": config.apiKeys.dataFabricApi,
					"Authorization": "Bearer " + req.user.apiTokens[dataFabric].accessToken
				}
			})
			const accessId = await JSON.parse(accesses).results[0].accessSharingId 
			const response = await request({ // Getting the access token using the containerId and accessId,
				method: "PUT",
				url: `https://api.veracity.com/veracity/datafabric/data/api/1/resources/${req.headers.id}/accesses/${accessId}/key`,
				headers: {
					"Ocp-Apim-Subscription-Key": config.apiKeys.dataFabricApi,
					"Authorization": "Bearer " + req.user.apiTokens[dataFabric].accessToken // Note that we do NOT use the same access token as when calling the Services API. This is because Data Fabric uses a different scope
				}
			})
			const data = await JSON.parse(response)
			const containerUri = "https://" + data.sasuRi.split("//")[1].split(".")[0] + ".blob.core.windows.net"
			const containerName = data.sasuRi.split("/")[data.sasuRi.split("/").length - 1]
			req.user.container = { // Need to parse some of the data to have easier access later on, especially when using Azure Storage 
				sasUri: data.sasuRi,
				sasKey: data.sasKey,
				fullKey: data.fullKey,
				containerUri,
				containerName,
				id: req.headers.id
			}
			next()
			
		} catch (error) {
			next(error)
		}
	}
}