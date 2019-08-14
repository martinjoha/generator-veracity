import { connect } from "react-redux"
import Blob from "./Blob"

import * as blobs from "../../../ducks/blobs.duck"
import * as blobActions from "../../../ducks/blobs.editors.duck"

export default connect((state, ownProps) => {
	const { blobName, id } = ownProps.match.params
	return {
		containerId: id,
		blobName,
		blob: blobs.getBlobByName(state, blobName),
		blobChanged: blobActions.getBlobChanged(state),
		errorMessage: blobs.getLocalErrorMessage(state, blobName)
	}
}, (dispatch, ownProps) => {
	const { id, blobName } = ownProps.match.params
	const fetchContent = (blob) => {
		if(Object.keys(blob).length > 0) {
			return blobs.fetchAppendBlob(id, blobName)
		} 
		return blobs.fetchBlobProperties(id, blobName)
	} 
		
	return {
		fetchContent: (blob) => dispatch(fetchContent(blob)),
		appendToBlob: (containerName, blobName, text) => dispatch(blobActions.appendToBlob(containerName, blobName, text)),
	}
})(Blob)