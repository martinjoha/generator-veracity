const request = require("request-promise-native")
// Middleware for checking if the SAS-token exists, will generate if not

module.exports = config => async (req, res, next) => {
	if(req.headers.id === req.user.tokens.data.container.id) {
		next()
	}

	const accesses = await request({
		url: `https://api.veracity.com/veracity/datafabric/data/api/1/resources/${req.headers.id}/accesses`,
		headers: {
			"Ocp-Apim-Subscription-Key": config.apiKeys.dataFabricApi,
			"Authorization": "Bearer " + req.user.tokens.data.access_token
		}
	})
	const accessId = await JSON.parse(accesses).results[0].accessSharingId 
	const response = await request({
		method: "PUT",
		url: `https://api.veracity.com/veracity/datafabric/data/api/1/resources/${req.headers.id}/accesses/${accessId}/key`,
		headers: {
			"Ocp-Apim-Subscription-Key": config.apiKeys.dataFabricApi,
			"Authorization": "Bearer " + req.user.tokens.data.access_token
		}
	})
	const data = await JSON.parse(response)
	const containerUri = "https://" + data.sasuRi.split("//")[1].split(".")[0] + ".blob.core.windows.net"
	const containerName = data.sasuRi.split("/")[data.sasuRi.split("/").length - 1]
	req.user.tokens.data.container = {
		sasUri: data.sasuRi,
		sasKey: data.sasKey,
		fullKey: data.fullKey,
		containerUri,
		containerName,
		id: req.headers.id
	}
	next()
}