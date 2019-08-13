import React, { Component } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"

import AppendBlob from "./AppendBlob"
import ImageBlob from "./ImageBlob"

import classes from "../Containers.scss"


class Blob extends Component {

	renderBlobDetails = () => {
		switch(this.props.blob.contentType) {

		case("image/jpeg"):
			return <ImageBlob
				blob={this.props.blob} />
		case("image/png"):	
			return <ImageBlob
				blob={this.props.blob} />
			
		default:
			return(
				<AppendBlob 
					containerName={this.props.container.reference}
					blob={this.props.blob}
					blobChanged={this.props.blobChanged}
					appendToBlob={this.props.appendToBlob} 
					fetchBlob={this.props.fetchBlob}/>
			)
		}		
	}

	renderLoadingScreen = () => {
		return (
			<div className={classes.container}>Loading content for blob</div>
		)
	}

	render() {
		if(this.props.blobs.length > 0 && Object.keys(this.props.blob).length === 0) {
			return (
				<div className={classes.container}>
					<h3>This blob does not exist</h3>
					<Link to={`/containers/${this.props.container.id}`}>Back to container</Link>
				</div>
			)
		}
		if(this.props.blob.content === undefined) {
			this.props.fetchContent(this.props.container, this.props.blobs, this.props.blob)
			return this.renderLoadingScreen()
		}
		return this.renderBlobDetails()
	}
}

Blob.propTypes = {
	container: PropTypes.object,
	blobName: PropTypes.string,
	blob: PropTypes.object,
	blobs: PropTypes.array,
	blobChanged: PropTypes.bool,

	fetchContent: PropTypes.func,
	fetchBlob: PropTypes.func,
	appendToBlob: PropTypes.func,
	fetchImageBlob: PropTypes.func,
}

export default Blob