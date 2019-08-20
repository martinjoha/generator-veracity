import { combineReducers } from "redux"

import * as user from "./user.duck"
import * as blobs from "./blobs.duck"
import * as containers from "./containers.duck"

/**
 * This object should contain the default exports from all ducks in our system.
 * By convention ducks should export their reducer as "reducer" for use when combining reducers.
 * Add new ducks to this object when they are implemented.
 */
export const ducks = {
	user,
	blobs,
	containers
}

/**
 * This method returns a set of combined reducers using the "reducer" export from all ducks.
 * Provided the ducks follow the "duck"-pattern this code should not need to be changed.
 */
export const rootReducer = () => {
	const reducers = Object.keys(ducks).reduce((acc, key) => {
		acc[key] = ducks[key].reducer
		return acc
	}, {})
	return combineReducers(reducers)
}
export default rootReducer