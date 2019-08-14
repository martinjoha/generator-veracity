import { createAction as createReduxAction, handleActions } from "redux-actions"
import axios from "axios"
import omit from "lodash/omit"

const _ns = "@containers/"
export const getState = globalState => globalState.containers || {}
const createAction = (action, payload) => createReduxAction(_ns + action, payload)

export const setLoading = createAction("SET_IS_LOADING", (flag = true) => flag)
export const isLoading = (state) => getState(state).loading
export const fetchContainersSuccess = createAction("FETCH_CONTAINERS_SUC", (flag = true) => flag)
export const isContainersFetched = (state) => !!getState(state).containersFetched

export const getContainers = (state) => getState(state).containers || []
export const getContainerById = (state, containerId) => getContainers(state).filter(container => container.id === containerId)[0] || null

export const setContainers = createAction("GET_CONTAINERS")
export const fetchContainers = () => async (dispatch, getState) => {
	const state = getState()
	if(isLoading(state)) return
	dispatch(setLoading())
	try {
		const response = await axios({
			url: "/_api/containers"
		})
		dispatch(setContainers(response.data.map(container => omit(container, ["metadata"])) || []))

	} catch(error) {
		dispatch(setContainers([]))
	}

}
	

export const reducer = handleActions({
	[setContainers]: (state, { payload }) => ({
		...state, 
		containersFetched: true,
		loading: false,
		containers: [...payload]
	}),
	[setLoading]: (state, { payload }) => ({
		...state,
		loading: payload
	}),
	[fetchContainersSuccess]: (state, { payload }) => ({
		...state,
		containersFetched: payload
	}),
}, {} )


export default reducer