import { createAction as createReduxAction, handleActions } from "redux-actions"
import axios from "axios"
import { createAppendText } from "../utils/parseText"


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

export const setContainerChanged = createAction("CONTAINER_CHANGED", (flag = true) => flag)
export const getContainerChanged = state => getState(state).containerChanged || false

export const deleteBlob = (containerId, blobName) => async dispatch => {
	dispatch(setContainerChanged(false))
	try {
		await axios({
			url: "/_api/container/deleteblob",
			headers: {
				id: containerId,
				blobName,
			}
		})
		dispatch((setContainerChanged()))
	} catch (error) {
		dispatch(setErrorMessage({containerId, message:error.response.data.message}))
	}
}

export const createBlob = (containerId, blobName, blobText, contentType) => async (dispatch) => {
	const parsedText = createAppendText(blobText)
	dispatch(setContainerChanged(false))
	try {
		await axios({
			url: "/_api/container/createblob",
			headers: {
				id: containerId,
				blobName,
				blobText: parsedText,
				contentType
			}
		})
		dispatch(setContainerChanged()) 
	} catch(error) {
		dispatch(setErrorMessage({containerId, message:error.response.data.message}))
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
		containerChanged: false
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
	[setContainerChanged]: (state, { payload }) => ({
		...state,
		containerChanged: payload
	})
}, {})

export default reducer