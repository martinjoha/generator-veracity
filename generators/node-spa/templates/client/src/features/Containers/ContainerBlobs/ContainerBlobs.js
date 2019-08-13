/* eslint-disable no-mixed-spaces-and-tabs */
import React, { Component } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"

import classes from "./ContainerBlobs.scss"

class ContainerBlobs extends Component {
	
	state = {
		newBlobName: "",
		newBlobText: "",
	}

  createBlob = async () => {
  	const { container } = this.props 
  	const { newBlobName, newBlobText } = this.state
  	await this.props.createBlob(newBlobName, newBlobText, container.reference, "text/plain")
  	if(this.props.blobCreated) {
  		this.props.fetchContent(this.props.container)
  		this.setState({
  			newBlobName: "",
  			newBlobText: ""
  		})
  	} 
  }

	deleteBlob = async (blobName) => {
		const { container } = this.props
		await this.props.deleteBlob(container.reference, blobName)
		if(this.props.blobDeleted) {
			this.props.fetchContent(container)
		}
	}

	changeInputValue = (e) => {
		this.setState({
			[e.target.id]: e.target.value
		})
	}

	renderBlobs = () => (
		this.props.blobs.map(blob => {
			return(
				<div className={classes.blob} key={blob.name}>
					<Link to={`/containers/${this.props.containerId}/blob/${blob.name}`}>
						<h3 key={blob.name}>Blob name: {blob.name}</h3>
					</Link>
					<div>
						<button id={blob.name} onClick={e => this.deleteBlob(e.target.id)}>Delete blob</button>
					</div>
				</div>
			)
		})
	)

	renderCreateForm = () => {
		return(
			<div className={classes.form}>
				<form>
					<input type="text" placeholder="Name of your new blob" id="newBlobName" onChange={e => this.changeInputValue(e)} value={this.state.newBlobName} />
					<input type="text" placeholder="Enter some text" id="newBlobText" onChange={e => this.changeInputValue(e)} value={this.state.newBlobText} />
				</form>
				<button onClick={this.createBlob}>Create Blob</button>
			</div>
		)
	}

	render() {
		if(this.props.errorMessage) {
			return (
				<div className={classes.container}>
					<div className={classes.blob}>
						<h3>{this.props.errorMessage}</h3>
						<Link to="/containers">Back to containers</Link>	
					</div>
				</div>
			)
		}

		if(!this.props.container && this.props.containersFetched) {
			return (
				<div className={classes.container}>
					<p>No containers with id {this.props.containerId}</p>
					<Link to="/containers" >Back to containers</Link>
				</div>
			)
		}

		if(this.props.blobs.length === 0 && !this.props.blobsFetched) {
			this.props.fetchContent(this.props.container)
			return (
				<div className={classes.container}>Loading...</div>
			)
		}

		return (
			<div className={classes.container}>
				{this.props.blobs.length > 0 ? 
					this.renderBlobs() : <h3>There are no blobs in this container</h3>}
				{this.renderCreateForm()}
			</div>
		)
	}
}

ContainerBlobs.propTypes = {
	containersFetched: PropTypes.bool,
	blobs: PropTypes.array,
	blobCreated: PropTypes.bool,
	blobDeleted: PropTypes.bool,
	containerId: PropTypes.string,
	currentContainer: PropTypes.string,
	container: PropTypes.object,
	errorMessage: PropTypes.string,
	blobsFetched: PropTypes.bool,

	fetchContent: PropTypes.func,
	createBlob: PropTypes.func,
	deleteBlob: PropTypes.func,
}

export default ContainerBlobs