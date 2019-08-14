import { connect } from "react-redux"
import * as user from "../ducks/user.duck"
import Routes from "./routes"

export default connect((state) => ({
	isAuth: user.isAuthenticated(state)
}))(Routes)