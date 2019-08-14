import { applyMiddleware, compose as reduxCompose, createStore } from "redux" // Import what we need from redux
import thunk from "redux-thunk" // Thunks allow us to do async state updates. We need this middleware to deal with AJAX calls
import rootReducer from "../ducks" // Import the composed set of reducers so they can be added to the store

// This is how we check if the devtools are present and optionally hook our store up to it.
const compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || reduxCompose

/**
 * This function creates a new store instance ready for use with Redux DevTools
 * @param {object} [initialState} The initial state of the store
 * @returns A new store object that supports the Redux DevTools extension
 */

export const newStore = (initialState = {}) => {
	const initialStateElement = document.getElementById("initialState")
	let initState = {}
	if(initialStateElement) {
		initState = JSON.parse(initialStateElement.innerHTML || "{}")
	}
	return createStore(rootReducer(), initState, compose(
		applyMiddleware(thunk)
	))
}