import { connect } from "react-redux"
import Blob from "./Blob"

import * as blobs from "../../../ducks/blobs.duck"
import * as blobActions from "../../../ducks/blobs.editors.duck"
import * as containers from "../../../ducks/containers.duck"

export default connect((state, ownProps) => {
	const { blobName, id } = ownProps.match.params
	return {
		containerId: id,
		blobName: blobName,
		blob: blobs.getBlobByName(state, blobName),
		blobs: blobs.getBlobs(state),
		blobChanged: blobActions.getBlobChanged(state),
		container: containers.getContainerById(state, id)
	}
}, (dispatch, ownProps) => {
	const { id, blobName } = ownProps.match.params
	const fetchContent = (container, currentBlobs, blob) => {
		if(!container) return containers.fetchContainers(`containers/${id}/blob/${blobName}`)
		if(currentBlobs.length === 0) return blobs.fetchBlobs(container.id, container.reference)
		return (blob.contentType === "text/plain" || blob.blobType === "AppendBlob") ? blobs.fetchAppendBlob(container.reference, blobName) : blobs.fetchImageBlob(container.reference, blobName)
	}
	return {
		fetchContent: (container, blobs, blob) => dispatch(fetchContent(container, blobs, blob)),
		fetchBlob: (containerName, blobName) => dispatch(blobs.fetchAppendBlob(containerName, blobName)),
		appendToBlob: (containerName, blobName, text) => dispatch(blobActions.appendToBlob(containerName, blobName, text)),
	}
})(Blob)