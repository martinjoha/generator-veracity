import { createAction as createReduxAction, handleActions } from "redux-actions"
import axios from "axios"

const _ns = "@blob/"
export const getState = globalState => globalState.blobs || {}
const createAction = (action, payload) => createReduxAction(_ns + action, payload)

export const getBlobs = state => getState(state).blobs || []
export const getBlobByName = (state, blobName) => (getBlobs(state).filter(blob => blob.name === blobName))[0] || {}

export const setLoading = createAction("SET_LOADING", (flag = true) => flag)
export const isLoading = state => getState(state).loading

export const setGlobalErrorMessage = createAction("SET_GLOBAL_ERROR_MESSAGE")
export const getGlobalErrorMessage = state => getState(state).errorMessage
export const setLocalErrorMessage = createAction("SET_LOCAL_ERROR_MESSAGE")
export const getLocalErrorMessage = (state, blobName) => getBlobs(state).filter(blob => blob.name === blobName)[0].errorMessage || null


export const setCurrentContainer = createAction("SET_CURRENT_CONTAINER")
export const getCurrentContainer = state => getState(state).currentContainer

export const setBlobs = createAction("SET_BLOBS") 
export const unsetBlobs = createAction("UNSET_BLOBS")
export const setBlobsFetched = createAction("SET_BLOBS_FETCHED")

export const getBlobsFetched = state => !!getState(state).blobsFetched
export const fetchBlobs = (containerId, containerName) => async (dispatch, getState) => {
	const state = getState()
	if(isLoading(state)) return 
	dispatch(setLoading())
	dispatch(setCurrentContainer(containerId))
	try {
		const response = await axios({
			url: "/_api/container/listblobs",
			headers: {
				id: containerId,
				containerName
			}
		})
		const data = response.data || []
		data.forEach(blob => blob.containerId = containerId)
		dispatch(setBlobs({ data, isEmpty: data.length === 0 }))

	} catch(error) {
		dispatch(setGlobalErrorMessage(error.response.data.message))
	} finally {
		dispatch(setBlobsFetched(true))
	}
}

export const setBlobContent = createAction("SET_BLOB_CONTENT")

// Helper function to update array with new values
const updateArray = (blobs, blobName, key, data) => {
	return blobs.map(blob => {
		if(blob.name === blobName) {
			return {
				...blob,
				[key]: data
			} 
		} else {return blob}
	})
}

export const fetchAppendBlob = (containerName, blobName) => async (dispatch, getState) => {
	const state = getState()
	const blobs = getBlobs(state)
	if (isLoading(state)) return
	dispatch(setLoading())
	try {
		const response = await axios({
			url: "/_api/container/blobdetails",
			headers: {
				containerName,
				blobName
			}
		})
		const data = response.data || ""
		const newBlobs = updateArray(blobs, blobName, "content", data)
		dispatch(setBlobContent(newBlobs))
	} catch(error) {
		return dispatch(setLocalErrorMessage({ message: error.response.data.message, blobName }))
	} 
}

export const fetchImageBlob = (containerName, blobName) => async (dispatch, getState) => {
	const state = getState()
	const blobs = getBlobs(state)
	if (isLoading(state)) return
	dispatch(setLoading())
	try {
		const response = await axios({
			url: "/_api/container/imageblob",
			headers: {
				containerName,
				blobName
			}
		})
		const data = response.data
		const newBlobs = updateArray(blobs, blobName, "content", data)
		dispatch(setBlobContent(newBlobs))
	} catch(error) {
		return dispatch(setLocalErrorMessage({ message: error.response.data.message, blobName }))	
	}
}

export const reducer = handleActions({
	[setBlobs]: (state, { payload }) => ({
		...state,
		blobs: [...payload.data],
		loading: false,
	}),
	[setLoading]: ((state, { payload }) => ({
		...state,
		loading: payload
	})),
	[setBlobContent]: ((state, { payload }) => ({
		...state,
		blobs: payload,
		loading: false,
	})),
	[setCurrentContainer]: (state, { payload }) => ({
		...state,
		currentContainer: payload
	}),
	[setGlobalErrorMessage]: (state, { payload }) => ({
		...state,
		errorMessage: payload
	}),
	[setLocalErrorMessage]: (state, payload) => ({
		...state,
		blobs: updateArray(getBlobs(state), payload.blobName, "errorMessage", payload.message)
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
}, { blobs: null, errorMessage: null })

export default reducer