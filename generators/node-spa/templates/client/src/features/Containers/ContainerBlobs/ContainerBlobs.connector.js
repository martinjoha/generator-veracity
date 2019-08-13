import { connect } from "react-redux"
import ContainerBlobs from "./ContainerBlobs"

import * as containers from "../../../ducks/containers.duck"
import * as blobs from "../../../ducks/blobs.duck"
import * as blobActions from "../../../ducks/blobs.editors.duck"
import * as user from "../../../ducks/user.duck"


export default connect((state, ownProps) => {
	const { id } = ownProps.match.params
	return {
		containerId: id,
		errorMessage: blobs.getGlobalErrorMessage(state),
		blobs: blobs.getBlobs(state),
		hasTriedLogin: user.getTriedLogin(state),
		containersFetched: containers.isContainersFetched(state),
		container: containers.getContainerById(state, id),
		currentContainer: blobs.getCurrentContainer(state),
		blobsFetched: blobs.getBlobsFetched(state),
		blobCreated: blobActions.getBlobCreated(state),
		blobDeleted: blobActions.getBlobDeleted(state),
	}
}, (dispatch, ownProps) => {
	
	const fetchContent = (container) => container ? blobs.fetchBlobs(container.id, container.reference) : containers.fetchContainers(`containers/${ownProps.match.params.id}`) 
	return {
		fetchContent: container => dispatch(fetchContent(container)),
		createBlob: (newBlobName, newBlobText, containerName, contentType) => dispatch(blobActions.createBlob(newBlobName, newBlobText, containerName, contentType)),
		deleteBlob: (containerName, blobName) => dispatch(blobActions.deleteBlob(containerName, blobName)),
	}
})(ContainerBlobs)