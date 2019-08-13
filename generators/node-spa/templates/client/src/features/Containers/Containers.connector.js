import { connect } from "react-redux"
import Containers from "./Containers"

import * as containers from "../../ducks/containers.duck"
import * as user from "../../ducks/user.duck"


export default connect((state) => ({
	isAuthenticated: user.isAuthenticated(state),
	containers: containers.getContainers(state),
	containersFetched: containers.isContainersFetched(state),
	hasTriedLogin: user.getTriedLogin(state)
}), (dispatch) => ({
	fetchContainers: () => dispatch(containers.fetchContainers()),
}))(Containers)