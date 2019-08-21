import { connect } from "react-redux"
import AddBlobItem from "./AddBlobItem"
import * as blobs from "../../../../ducks/blobs.duck"

export default connect((state, ownProps) => ({
	errorMessage: blobs.getErrorMessage(state, ownProps.containerId),
	isCreatingBlob: blobs.isCreatingBlob(state, ownProps.containerId)
}), (dispatch, ownProps) => ({
	createBlob: (newBlobName, newBlobText, contentType) => (
		dispatch(blobs.createBlob(ownProps.containerId, newBlobName, newBlobText, contentType))
	)
}))(AddBlobItem)