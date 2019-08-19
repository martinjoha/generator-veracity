import { createAction as createReduxAction, handleActions } from "redux-actions"
import axios from "axios"
import { createAppendText } from "../utils/parseText"


const _ns = "@blobActions/"
export const getState = globalState => globalState.blobActions || {}
const createAction = (action, payload) => createReduxAction(_ns + action, payload)

export const setErrorMessage = createAction("SET_ERROR_MESSAGE")
export const getErrorMessage = state => getState(state).errorMessage

export const deleteBlob = (containerId, blobName) => async dispatch => {
	try {
		await axios({
			url: "/_api/container/deleteblob",
			headers: {
				id: containerId,
				blobName,
			}
		})
		return true
	} catch (error) {
		return dispatch(setErrorMessage(error.response.data.message))
	}
}


export const createBlob = (containerId, blobName, blobText, contentType) => async (dispatch) => {
	const parsedText = createAppendText(blobText)
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
		return true

	} catch(error) {
		return dispatch(setErrorMessage(error.response.data.message))
	}
}

export const reducer = handleActions({
	[setErrorMessage]: (state, { payload }) => ({
		...state,
		errorMessage: payload
	}),
}, { blobCreated: false, blobDeleted: false }) 

export default reducer