import { createAction as createReduxAction, handleActions } from "redux-actions"
import axios from "axios"

const _ns = "@blob/"
export const getState = globalState => globalState.blobs || {}
const createAction = (action, payload) => createReduxAction(_ns + action, payload)

export const getBlobs = state => getState(state).blobs || []
export const getBlobByName = (state, blobName) => (getBlobs(state).filter(blob => blob.name === blobName))[0] || {}

export const setLoading = createAction("SET_LOADING", (flag = true) => flag)
export const isLoading = state => getState(state).loading

export const setErrorMessage = createAction("SET_ERROR_MESSAGE")
export const getErrorMessage = state => getState(state).errorMessage

export const setCurrentContainer = createAction("SET_CURRENT_CONTAINER")
export const getCurrentContainer = state => getState(state).currentContainer

export const setBlobs = createAction("SET_BLOBS") 
export const unsetBlobs = createAction("UNSET_BLOBS")
export const setBlobsFetched = createAction("SET_BLOBS_FETCHED")

export const getBlobsFetched = state => !!getState(state).blobsFetched
export const fetchBlobs = (containerId) => async (dispatch, getState) => {
	const state = getState()
	if(isLoading(state)) return 
	dispatch(setLoading())
	dispatch(setCurrentContainer(containerId))
	try {
		const response = await axios({
			url: "/_api/container/listblobs",
			headers: {
				id: containerId,
			}
		})
		const data = response.data || []
		dispatch(setBlobs(data))

	} catch(error) {
		dispatch(setErrorMessage(error.response.data.message))
	} finally {
		dispatch(setBlobsFetched(true))
	}
}



export const reducer = handleActions({
	[setBlobs]: (state, { payload }) => ({
		...state,
		blobs: payload,
		loading: false,
	}),
	[setLoading]: ((state, { payload }) => ({
		...state,
		loading: payload
	})),
	[setCurrentContainer]: (state, { payload }) => ({
		...state,
		currentContainer: payload
	}),
	[setErrorMessage]: (state, { payload }) => ({
		...state,
		errorMessage: payload
	}),
	[setBlobsFetched]: (state, { payload }) => ({
		...state,
		blobsFetched: payload,
		loading: false
	}),
	[unsetBlobs]: (state) => ({
		...state,
		blobs: null,
		errorMessage: null,
		blobsFetched: false,
	})
}, {})

export default reducer