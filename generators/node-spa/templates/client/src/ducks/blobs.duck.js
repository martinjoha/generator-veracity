import { createAction as createReduxAction, handleActions } from "redux-actions"
import axios from "axios"

const _ns = "@blob/"
export const getState = globalState => globalState.blobs || {}
const createAction = (action, payload) => createReduxAction(_ns + action, payload)

export const getBlobsForContainer = (state, containerId) => getState(state)[containerId] ? getState(state)[containerId].files || [] : []
export const getContainerFetched = ( state, containerId ) => !!getState(state)[containerId]

export const setLoading = createAction("SET_LOADING", (flag = true) => flag)
export const isLoading = state => !!getState(state).loading

export const setErrorMessage = createAction("SET_ERROR_MESSAGE")
export const getErrorMessage = (state, containerId) => getState(state)[containerId] ? getState(state)[containerId].errorMessage || null : null

export const setBlobs = createAction("SET_BLOBS")

export const getBlobsFetched = state => !!getState(state).blobsFetched
export const fetchBlobs = (containerId) => async (dispatch, getState) => {
	const state = getState()
	if(isLoading(state)) return 
	dispatch(setLoading())
	try {
		const response = await axios({
			url: "/_api/container/listblobs",
			headers: {
				id: containerId,
			}
		})
		const data = response.data || []
		dispatch(setBlobs({ data, containerId }))
	} catch(error) {
		dispatch(setErrorMessage({ message: error.response.data.message, containerId }))
	} finally {
		dispatch(setLoading(false))
	}
}

export const reducer = handleActions({
	[setBlobs]: (state, { payload }) => ({
		...state,
		[payload.containerId]: {
			...state.containerId,
			files: payload.data
		},
		loading: false,
	}),
	[setLoading]: ((state, { payload }) => ({
		...state,
		loading: payload
	})),
	[setErrorMessage]: (state, { payload }) => ({
		...state,
		[payload.containerId]: {
			...state.containerId,
			errorMessage: payload.message
		}
	}),
}, {})

export default reducer