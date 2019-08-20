# Veracity Single-Page-Application
Welcome to your generated Single-Page application. This is your starting point for building an app that integrates with Veracity. The application will authenticate the user as well as giving access to the different containers the user has access to. The user can also "enter" a container and add, delete and update content, as well as viewing content details. The project consists of a `client` and `server`. 


## **BEFORE YOU BEGIN**
Before you start any kind of development here or connect it to your code repository you should avoid committing files that are not needed. For GIT you do this by creating a file `.gitignore` in the root folder of your project. It should contain at least the following:

```
node_modules
.cache
dist
server/src/config/tokens.js
```

Before starting the application make sure you have gotten the required credentials on developer.veracity.com.

In addition to getting the credentials from developer.veracity.com, you need to subscribe to the Veracity APIs that you need. If you only need to authenticate users, you only need the Services API. If you want access to Data Fabric and other services, you'll need to perform additional [subscriptions]("https://api-portal.veracity.com/products")

You should also subscribe to the Veracity APIs that are needed. If you only want to authenticate a user you only need to subsrice to the Services API, but if you also want access to the Data Fabric, you must subscribe there as well.
When the subscriptions are confirmed you will receive subscription keys that are necessary for doing API calls.

## Caveat
This code gives you a good starting point, but it is provide without **ANY** warranty expressed or implied. Use at your own risk.

## Development
This project is optimized for development with [VisualStudio Code (VSCode)](https://code.visualstudio.com/). It contains the necessary configuration to start the server component in debug mode directly by hitting F5 (see documentation for the debug tool in VSCode online).

1. Start the client code by running `npm start` within the `client` folder.
2. Start the server in debug mode from VSCode by hitting F5 or by using the debug tools and selecting the "Debug Veracity SPA" configuration.

After this you should now have a running development environment supporting hot-reloading of client changes.

## Production
To build the project for production just run:
```
npm run build
```

in the `client` and `server` folders respectively. The final application will outputted to the `dist` folder.

## Overview

### 1.1 Authentication

The authentication process can be complex to grasp at first. We highly recommend that you familiarize yourself with how the OpenID Connect flow works if you plan to work with the Veracity APIs. See [Understand the OpenID Connect control flow in Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-protocols-openid-connect-code) for details.

The authentication process can be summed up like this:

1. User opens the page and clicks login.
2. We redirect the user to a specific url on Azure B2C and provide a set of configuration options including a request for authentication and an access token to access the Veracity API. At this point the user leaves our control and is handed over to Azure B2C.
3. Behind the scenes Azure B2C may redirect the request to ADFS in order to perform authentication. If the user logs in correctly, Azure B2C will return them back to us with several pieces of information including the user identity.
4. We receive this information and store it on our server for use later. Doing so saves us from having to call back to Azure B2C on every request in order to verify the user again.
5. At this point we can use the information Azure B2C returned to us to perform requests to the Veracity API provided we requested the information to begin with.
6. Every time the user performs an action that requires a call to the Veracity API we perform this by adding the users access token to the request.
7. Once the user finishes their work they click logout.
8. We then remove all our session information about the user and redirect them to Azure B2C so they can do the same.
9. Finally, we redirect them to ADFS so that it can remove the final set of session cookies. At this point, the user is completely signed out.


The files mostly concerned with authentication in this application are inside the `dataFabric` folder, and `setupUserAuthentication.js` and `setupDatafabricAuthentication.js` handles the authentication process for the Services API and Data Fabric API respectively. They are both relatively similar, though you have to use a different scope for obtaining the tokens. 

The two different scopes are: 

```javascript
servicesAPI: "https://dnvglb2cprod.onmicrosoft.com/83054ebf-1d7b-43f5-82ad-b2bde84d7b75/user_impersonation"
dataFabricAPI: "https://dnvglb2cprod.onmicrosoft.com/37c59c8d-cd9d-4cd5-b05a-e67f1650ee14/user_impersonation"
```

After a user has completed the authentication process, passport obtains two tokens, an **access token**, and a **refresh token**. The access token is the one to be attached in the request header when accessing the Veracity APIs, and the refresh token is used to gain a new access token if it has expired. 

### 1.2 Connecting to containers 

The Veracity Data Fabric API contains all the information about a user's containers and the rights to the different containers. The API will give you a SAS-token to be able to access Azure Storage, and this is where all your data is stored.
The containers can store all sorts of files in a data lake of unstructured data, where each file is called a blob.

To get access to the content of a container in Azure Storage a user will need the Shared Access Storage token for the container as well as the host address for the user's storage. This is done through a 3 step process: 

A user has to get the resourceID of the container:


```javascript
const userResources = await request({
	url: `https://api.veracity.com/veracity/datafabric/data/api/1/resources/`,
	method: "GET",
	headers: {
		"Ocp-Apim-Subscription-Key": dataFabricApiKey,
		"Authorization": "Bearer " + req.user.tokens.data.access_token
	}
})
```

This endpoint will return all the resources available to a user.

Please note that the access token cannot be the same as the one used for user authentication, but the access token obtained when using the data fabric scope.

A user can now get a list of Providers that have access to a specific resource, and get accesId's for a specific resource.

```javascript
const userAccesses = await request({
	url: `https://api.veracity.com/veracity/datafabric/data/api/1/resources/${resourceId}/accesses`,
	headers: {
		"Ocp-Apim-Subscription-Key": dataFabricApiKey,
		"Authorization": "Bearer " + req.user.tokens.data.access_token
	}
})
```

Using one of the accessId's obtained from this API call, a user now has the required information about the resource to get a SAS-token from Veracity, using the resourceId and an accessId:

```javascript
const sasData = await request({
	method: "PUT",
	url: `https://api.veracity.com/veracity/datafabric/data/api/1/resources/${resourceId}/accesses/${accessId}/key`,
	headers: {
		"Ocp-Apim-Subscription-Key": dataFabricApiKey,
		"Authorization": "Bearer " + req.user.tokens.data.access_token
	}
})
const containerData = await JSON.parse(sasData)
req.user.tokens.data.container = {
	sasUri: data.sasuRi,
	sasKey: data.sasKey,
	fullKey: data.fullKey
}
```

The user can now communicate directly with Azure storage, and upload and download storage blobs.

### 1.3 Azure Storage

A user's containers in Azure storage contain storage blobs, which are unstructured data files. They can be text files, csv files, images etc.

To be able to communicate with Azure Storage, a user needs the SAS-token and the Host URL for the specific storage. In order to get the host URL you need to parse the sasUri parameter in the last endpoint. This parameter us a string and has the following structure:
```{hostUri}/{containerName}```

To get access to Azure Storage a user needs to create a blob service:

```javascript
const azure = require("azure-storage")
const sharedBlobSvc = azure.createBlobServiceWithSas(hostUrl, sasToken)
```

The user can now access the different blobs in the specific container.

All the provided Azure Blob Service methods are available [here](https://azure.github.io/azure-storage-node/BlobService.html)