import { connect } from "react-redux"
import BlobItem from "./BlobItem"

import * as blobs from "../../../../ducks/blobs.duck"

export default connect((state, ownProps) => ({
	isDeleting: blobs.isDeleting(state, ownProps.containerId, ownProps.blob.name)
}), (dispatch, ownProps) => ({
	deleteBlob: () => dispatch(blobs.deleteBlob(ownProps.containerId, ownProps.blob.name))
}))(BlobItem)