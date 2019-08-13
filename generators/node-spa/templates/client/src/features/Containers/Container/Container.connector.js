import { connect } from "react-redux"
import Container from "./Container"
import * as blobs from "../../../ducks/blobs.duck"

export default connect((state) => ({
	currentContainer: blobs.getCurrentContainer(state)
}), (dispatch) => ({
	unsetBlobs: () => dispatch(blobs.unsetBlobs())
}))(Container)