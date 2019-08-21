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

export const setDeleteErrorMessage = createAction("SET_DELETE_ERROR_MESSAGE")
export const setIsDeleting = createAction("DELETING_BLOB")
export const isDeleting = (state, containerId, blobName) => (
	!!getBlobsForContainer(state, containerId).filter(blob => blob.name === blobName)[0].isDeleting
)


export const deleteBlob = (containerId, blobName) => async (dispatch, getState) => {
	const state = getState(state)
	dispatch(setIsDeleting({ containerId, blobName }))
	try {
		await axios({
			url: "/_api/container/deleteblob",
			headers: {
				id: containerId,
				blobName,
			}
		})
		dispatch(setBlobs({ 
			containerId, 
			data: getBlobsForContainer(state, containerId).filter(blob => blob.name !== blobName) 
		}))
	} catch (error) {
		return dispatch(setErrorMessage(error.response.data.message))
	}
}


export const setCreatingBlob = createAction("CREATING_BLOB")
export const isCreatingBlob = (state, containerId) => !!getState(state)[containerId].isCreatingBlob 
export const createBlob = (containerId, blobName, blobText, contentType) => async (dispatch) => {
	const parsedText = createAppendText(blobText)
	try {
		dispatch(setCreatingBlob({ containerId, isCreatingBlob: true }))
		await axios({
			url: "/_api/container/createblob",
			headers: {
				id: containerId,
				blobName,
				blobText: parsedText,
				contentType
			}
		})
		dispatch(setCreatingBlob({ containerId, isCreatingBlob: false }))
		dispatch(fetchBlobs(containerId))
	} catch(error) {
		return dispatch(setErrorMessage(error.response.data.message))
	}
}

//Helper function to add some state to the file object
const updateBlobArray = (localState, containerId, blobName, key, value) => {
	return (
		localState[containerId].files.map(blob => {
			if(blob.name === blobName) {
				return {
					...blob,
					[key]: value 
				}
			} else return blob
		})	
	)
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
			...state[payload.containerId],
			errorMessage: payload.message
		}
	}),
	[setIsDeleting]: (state, { payload }) => ({
		...state,
		[payload.containerId]: {
			...state[payload.containerId],
			files: updateBlobArray(state, payload.containerId, payload.blobName, "isDeleting", true)
		}
	}),
	[setDeleteErrorMessage]: (state, { payload }) => ({
		...state,
		[payload.containerId]: {
			...state[payload.containerId],
			file: updateBlobArray(state, payload.containerId, payload.blobName, "errorMessage", payload.isDeleting)
		}
	}),
	[setCreatingBlob]: (state, { payload }) => ({
		...state,
		[payload.containerId]: {
			...state[payload.containerId],
			isCreatingBlob: payload.isCreatingBlob
		}
	})
}, {})

export default reducer