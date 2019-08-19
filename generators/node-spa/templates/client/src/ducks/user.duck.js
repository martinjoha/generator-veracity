import { createAction as createReduxAction, handleActions } from "redux-actions"
import omit from "lodash/omit"
import axios from "axios"

const _ns = "@user/"
export const getState = globalState => globalState.user || {}
const createAction = (action, payload) => createReduxAction(_ns+action, payload)

export const isAuthenticated = state => !!getState(state).authenticated
export const setAuthenticated = createAction("SET_AUTHENTICATED", (flag = true) => flag)

export const getId = state => getState(state).id
export const getFullName = state => getState(state).firstName + " " + getState(state).lastName
export const getEmail = state => getState(state).email
export const getInitials = state => {
	if (!getState(state).firstName || !getState(state).lastName) return "N/A"
	return getState(state).firstName.charAt(0).toLocaleUpperCase() + getState(state).lastName.charAt(0).toLocaleUpperCase()
}

export const setUser = data => {
	if (!data) return setProperties({
		authenticated: false,
		id: undefined
	})
	return setProperties({
		authenticated: true,
		...data
	})
}

export const setProperties = createAction("SET_USER_PROPERTIES") // Set one or more property values as an object
export const unsetProperties = createAction("UNSET_USER_PROPERTIES") // Unset properties by defining an array of property names to unset

export const isLoading = state => !!getState(state).loading
export const setLoading = createAction("SET_IS_LOADING", (flag = true) => flag)

export const fetchUser = () => async (dispatch, getState) => {
	const state = getState()
	if (isLoading(state)) return
	dispatch(setLoading())

	try {
		const response = await axios({
			url: "/_api/user"
		})
		const data = response.data || {}
		dispatch(setAuthenticated())
		dispatch(setProperties(data))
	} catch (error) {
		dispatch(setAuthenticated(false))
		dispatch(unsetProperties(["id", "firstName", "lastName", "email"]))
	} finally {
		dispatch(setLoading(false))
	}
}

export const reducer = handleActions({
	[setProperties]: (state, { payload }) => ({
		...state,
		...payload
	}),
	[unsetProperties]: (state, { payload }) => omit(state, payload),
	[setAuthenticated]: (state, { payload }) => ({
		...state,
		authenticated: payload
	}),
	[setLoading]: (state, { payload }) => ({
		...state,
		loading: payload
	}),
}, {})
export default reducer