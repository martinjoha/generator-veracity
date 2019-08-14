import { connect } from "react-redux"
import ContainerContent from "./ContainerContent"

import * as blobs from "../../../ducks/blobs.duck"
import * as blobActions from "../../../ducks/blobs.editors.duck"


export default connect((state) => {
	return {
		errorMessage: blobs.getErrorMessage(state),
		blobs: blobs.getBlobs(state),
		blobsFetched: blobs.getBlobsFetched(state),
		blobCreated: blobActions.getBlobCreated(state),
		blobDeleted: blobActions.getBlobDeleted(state),
	}
}, (dispatch, ownProps) => {
	return {
		fetchContent: () => dispatch(blobs.fetchBlobs(ownProps.match.params.id)),
		createBlob: (newBlobName, newBlobText, containerName, contentType) => dispatch(blobActions.createBlob(newBlobName, newBlobText, containerName, contentType)),
		deleteBlob: (blobName) => dispatch(blobActions.deleteBlob(blobName)),
	}
})(ContainerContent)