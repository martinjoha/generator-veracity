import { connect } from "react-redux"
import ContainerContent from "./ContainerContent"

import * as blobs from "../../../ducks/blobs.duck"
import * as blobActions from "../../../ducks/blobs.editors.duck"


export default connect((state, ownProps) => {
	return {
		errorMessage: blobs.getErrorMessage(state, ownProps.match.params.id),
		files: blobs.getBlobsForContainer(state, ownProps.match.params.id),
		loading: blobs.isLoading(state),
		containerFetched: blobs.getContainerFetched(state, ownProps.match.params.id),
	}
}, (dispatch, ownProps) => {
	const { id } = ownProps.match.params
	return {
		fetchContent: () => dispatch(blobs.fetchBlobs(id)),
		createBlob: (newBlobName, newBlobText, containerName, contentType) => dispatch(blobActions.createBlob(id, newBlobName, newBlobText, containerName, contentType)),
		deleteBlob: (blobName) => dispatch(blobActions.deleteBlob(id, blobName)),
	}
})(ContainerContent)