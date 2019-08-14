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
export const deleteBlob = (blobName) => async dispatch => {
	dispatch(blobDeleted(false))
	try {
		await axios({
			url: "/_api/container/deleteblob",
			headers: {
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
export const createBlob = (blobName, blobText, contentType) => async (dispatch) => {
	const parsedText = createAppendText(blobText)
	dispatch(blobCreated(false))
	try {
		await axios({
			url: "/_api/container/createblob",
			headers: {
				blobName,
				blobText: parsedText,
				contentType
			}
		})
		return dispatch(blobCreated())

	} catch(error) {
		return dispatch(setErrorMessage(error.response.data.message))
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
}, {}) 

export default reducer