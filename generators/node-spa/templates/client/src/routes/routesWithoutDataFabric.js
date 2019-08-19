import React from "react"
import { Route, Switch } from "react-router"
import Home from "../features/Home"
import User from "../features/User"
import NotFound from "../features/NotFound"

export const Routes = () => (
	<Switch>
		<Route path="/" exact component={Home}/>
		<Route path="/user" exact component={User}/>
		<Route component={NotFound}/>
	</Switch>
)
export default Routes