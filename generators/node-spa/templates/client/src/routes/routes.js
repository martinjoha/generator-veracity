import React from "react"
import { Route, Switch } from "react-router"
import PropTypes from "prop-types"
import Home from "../features/Home"
import User from "../features/User"
import NotFound from "../features/NotFound"
import Containers from "../features/Containers"
import ContainerContent from "../features/Containers/ContainerContent"




const ProtectedRoute = ({ isAuth, ...props }) => {
	if(isAuth) {
		return <Route path={props.path} {...props}/>
	}
	window.location.assign(`/login?redirectTo=${window.location.pathname.replace("/", "")}`)
	return <div>loading</div>
}
	

ProtectedRoute.propTypes = {
	isAuth: PropTypes.bool,
	path: PropTypes.string,
}



export const Routes = (props) => (
	<Switch>
		<Route path="/" exact component={Home}/>
		<Route path="/user" exact component={User}/>
		<Route path="/logout" exact component={Home}/>
		<ProtectedRoute path="/containers/:id" exact component={ContainerContent} isAuth={props.isAuth}/>
		<ProtectedRoute path="/containers" exact component={Containers}  isAuth={props.isAuth}/>
		<Route component={NotFound}/>
	</Switch>
)
export default Routes

Routes.propTypes = {
	isAuth: PropTypes.bool
}