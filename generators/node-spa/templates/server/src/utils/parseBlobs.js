module.exports = (blobs) => {
	let newBlobs = []

	blobs.forEach(blob => {
		newBlobs.push({
			name: blob.name,
			blobType: blob.blobType,
			lastModified: blob.lastModified,
			creationTime: blob.creationTime,
			contentType: blob.contentSettings.contentType
		})	
	})
	return newBlobs
}