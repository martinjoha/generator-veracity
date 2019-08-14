import React from "react"
import { newStore } from "./store/newStore"
import { ducks } from "./ducks"
import { Provider } from "react-redux"
import Routes from "./routes"
import { BrowserRouter as Router } from "react-router-dom"
import Header from "./features/Header"
import Footer from "./features/Footer"

import classes from "./App.scss"

export class App extends React.PureComponent {
	constructor(props) {
		super(props)

		this.store = newStore()
		window.app = this // This exposes our app instance on window so that we can run debug commands from the console.
	}

	componentDidMount() {
		this.store.dispatch(ducks.user.fetchUser())
	}

	/**
	 * This exposes all our ducks on the app instance to allow us easier access for debugging.
	 */
	get ducks() {
		return ducks
	}
	/**
	 * Another helper that exposes the entire redux state on the app instance for debugging.
	 */
	getState() {
		return this.store.getState()
	}

	render() {
		return (
			<Provider store={this.store}>
				<Router>
					<Header/>
					<div className={classes.content}>
						<Routes ContentComponent={React.createElement("div", { className: classes.content })}/>
					</div>
					<Footer/>
				</Router>
			</Provider>
		)
	}
}
export default App