import React, { Component } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"

import AppendBlob from "./AppendBlob"
import classes from "../Containers.scss"

class Blob extends Component {

	renderLoadingScreen = () => {
		return (
			<div>Loading content for blob</div>
		)
	}

	render() {
		if(this.props.errorMessage){
			return (
				<div className={classes.container}>
					<h3>{this.props.errorMessage}</h3>
					<Link to={`/containers/${this.props.containerId}`}>Back to container</Link>
				</div>
			)	
		}
		
		if(this.props.blob.content === undefined) {
			this.props.fetchContent(this.props.blob)
			return this.renderLoadingScreen()
		}
		return (
			<div>
				<div className={classes.container}>
					<Link to={`/containers/${this.props.containerId}`}>Back to container</Link>
				</div>
				<AppendBlob 
					blob={this.props.blob}
					blobChanged={this.props.blobChanged}
					appendToBlob={this.props.appendToBlob} 
					fetchContent={this.props.fetchContent}/>
			</div>
		)
	}
}

Blob.propTypes = {
	blobName: PropTypes.string,
	blobChanged: PropTypes.bool,
	blob: PropTypes.object,
	errorMessage: PropTypes.string,
	containerId: PropTypes.string,

	fetchContent: PropTypes.func,
	appendToBlob: PropTypes.func,
	fetchImageBlob: PropTypes.func,
}

export default Blob