import React from "react"
import { Route, Switch } from "react-router"
import Home from "../features/Home"
import User from "../features/User"
import NotFound from "../features/NotFound"
import Containers from "../features/Containers"
import Blob from "../features/Containers/Blob"
import ContainerBlobs from "../features/Containers/ContainerBlobs"


export const Routes = () => (
	<Switch>
		<Route path="/" exact component={Home}/>
		<Route path="/user" exact component={User}/>
		<Route path="/logout" exact component={Home}/>
		<Route path="/containers/:id" exact component={ContainerBlobs} />
		<Route path="/containers" exact component={Containers} />
		<Route path="/containers/:id/blob/:blobName" exact component={Blob} />
		<Route component={NotFound}/>
	</Switch>
)
export default Routes