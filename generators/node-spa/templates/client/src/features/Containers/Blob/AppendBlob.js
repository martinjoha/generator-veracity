import React, { Component } from "react"
import PropTypes from "prop-types"

import classes from "../Containers.scss"

class AppendBlob extends Component {


	state = {
		appendText: ""
	}

	changeInput = (e) => {
		this.setState({ [e.target.id]: e.target.value })
	}

	appendToBlob = async () => {
		const { containerName, blob } = this.props
		await this.props.appendToBlob(containerName, blob.name, this.state.appendText)
		if(this.props.blobChanged){
			this.props.fetchContent(blob)
			this.setState({ appendText: "" })
		}
	}

	renderLines= () => {
		return this.props.blob.content.split("\n").map((line, i) => (
			<p key={i}>{line}</p>
		))
	}

	render() {
		const { blob } = this.props
		return (
			<div className={classes.container}>
				<div>
					<h3>Blob name: {blob.name}</h3>
					<p>Blob type: {blob.blobType}</p>
					<div>{this.renderLines()}</div>
				</div>
				<div>
					<h3>Append to blob</h3>
					<form onSubmit={this.appendToBlob}>
						<input id="appendText" onChange={e => this.changeInput(e)} value={this.state.appendText} />
					</form>	
					<button onClick={this.appendToBlob}>Append to blob</button>
				</div>
			</div>
		)
	}
}


AppendBlob.propTypes = {
	blob: PropTypes.object,
	containerName: PropTypes.string,
	blobName: PropTypes.string,
	blobChanged: PropTypes.bool,

	fetchContent: PropTypes.func,
	appendToBlob: PropTypes.func
}

export default AppendBlob