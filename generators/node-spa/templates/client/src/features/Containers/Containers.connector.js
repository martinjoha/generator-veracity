import { connect } from "react-redux"
import Containers from "./Containers"

import * as containers from "../../ducks/containers.duck"

export default connect((state) => ({
	containers: containers.getContainers(state),
	loading: containers.isLoading(state),
	errorMessage: containers.getErrorMessage(state),
	containersFetched: containers.getContainersFetched(state)
}), (dispatch) => ({
	fetchContainers: () => dispatch(containers.fetchContainers()),
}))(Containers)