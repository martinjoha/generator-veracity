import React, { Component } from "react"
import PropTypes from "prop-types"

import classes from "./Containers.scss"

import Container from "./Container"

class Containers extends Component {



	renderContainers = () => {
		return this.props.containers.map(container => (
			<Container container={container} key={container.id} />
		))
	}

	render() {

		if(!this.props.containersFetched) {
			this.props.fetchContainers()
			return (
				<div>Loading...</div>
			)
		}

		return(
			<div className={classes.container}>
				{this.props.containers.length === 0 ? <div>You have no containers</div> : this.renderContainers()}
			</div>
		)
	}
}

Containers.propTypes = {
	containers: PropTypes.array,
	containersFetched: PropTypes.bool,	

	fetchContainers: PropTypes.func,
}

export default Containers