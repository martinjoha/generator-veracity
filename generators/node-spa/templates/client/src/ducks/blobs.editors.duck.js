import { createAction as createReduxAction, handleActions } from "redux-actions"
import axios from "axios"
import { createAppendText } from "../utils/parseText"


const _ns = "@blobActions/"
export const getState = globalState => globalState.blobActions || {}
const createAction = (action, payload) => createReduxAction(_ns + action, payload)


export const setErrorMessage = createAction("SET_ERROR_MESSAGE")
export const getErrorMessage = state => getState(state).errorMessage


export const blobDeleted = createAction("BLOB_DELETED_SUCCESS", (flag = true) => flag)
export const getBlobDeleted = state => getState(state).blobDeleted
export const deleteBlob = (containerName, blobName) => async dispatch => {
	dispatch(blobDeleted(false))
	try {
		await axios({
			url: "/_api/container/deleteblob",
			headers: {
				containerName,
				blobName,
			}
		})
		return dispatch(blobDeleted())
	} catch (error) {
		return dispatch(setErrorMessage(error.response.data.message))
	}
}

export const blobCreated = createAction("BLOB_CREATED_SUCCESS", (flag = true) => flag)
export const getBlobCreated = (state) => !!getState(state).blobCreated
export const createBlob = (blobName, blobText, containerName, contentType) => async (dispatch) => {
	const parsedText = createAppendText(blobText)
	dispatch(blobCreated(false))
	try {
		await axios({
			url: "/_api/container/createblob",
			headers: {
				blobName,
				blobText: parsedText,
				containerName,
				contentType
			}
		})
		return dispatch(blobCreated())

	} catch(error) {
		return dispatch(setErrorMessage(error.response.data.message))
	}
}


export const blobChanged = createAction("BLOB_CHANGED", (flag = true) => flag)
export const getBlobChanged = state => !!getState(state).blobChanged
export const appendToBlob = (containerName, blobName, text) => async (dispatch) => { 
	const parsedText = createAppendText(text)
	try {
		await axios({
			method: "POST",
			url: "/_api/container/appendtoblob",
			headers: {
				containerName,
				blobName,
				text: parsedText
			}
		})
		return dispatch(blobChanged())
	} catch (error) {
		return dispatch(setErrorMessage({ message: error.response.data.message, blobName }))
	}
}


export const reducer = handleActions({
	[blobCreated]: (state, { payload }) => ({
		...state,
		blobCreated: payload
	}),
	[blobDeleted]: (state, { payload }) => ({
		...state,
		blobDeleted: payload
	}),
	[setErrorMessage]: (state, { payload }) => ({
		...state,
		errorMessage: payload
	}),
	[blobChanged]: (state, { payload }) => ({
		...state,
		blobChanged: payload
	})
}, {}) 

export default reducer