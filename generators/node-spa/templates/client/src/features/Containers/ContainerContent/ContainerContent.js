/* eslint-disable no-mixed-spaces-and-tabs */
import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"

import classes from "./ContainerContent.scss"

const ContainerContent = (props) => {
	const [newBlobName, setNewBlobName] = useState("")
	const [newBlobText, setNewBlobText] = useState("")

	useEffect(() => {
		if(!props.containerFetched) {
			props.fetchContent()
		}
	}, [props.containerId])

	const createBlob = async () => {
  	if(await props.createBlob(newBlobName, newBlobText, "text/plain")) {
  		props.fetchContent()
			setNewBlobName("")
			setNewBlobText("")
  	} 
	}
	
	const deleteBlob = async (blobName) => {
		if(await props.deleteBlob(blobName)) {
			props.fetchContent()
		}
	}

	const renderFiles = () => (
		props.files.map(blob => {
			return(
				<div className={classes.blob} key={blob.name}>
					<a href={blob.url} target="_blank" rel="noopener noreferrer">
						<h3 key={blob.name}>Blob name: {blob.name}</h3>
					</a>
					<div>
						<button id={blob.name} onClick={e => deleteBlob(e.target.id)}>Delete blob</button>
					</div>
				</div>
			)
		})
	)
	const renderCreateForm = () => {
		return(
			<div className={classes.form}>
				<form>
					<input type="text" placeholder="Name of your new blob" onChange={(e) => setNewBlobName(e.target.value)} value={newBlobName} />
					<input type="text" placeholder="Enter some text" onChange={e => setNewBlobText(e.target.value)} value={newBlobText} />
				</form>
				<button onClick={createBlob}>Create Blob</button>
			</div>
		)
	}
	if(props.errorMessage) {
		return (
			<div className={classes.container}>
				<h3>{props.errorMessage}</h3>
				<Link to="/containers">Back to containers</Link>	
			</div>
		)
	}
	return (
		<div>
			{(props.loading || !props.containerFetched) ? <div className={classes.container}>Loading...</div> :
				<div className={classes.container}>
					<Link to="/containers">Back to containers</Link>
					{props.files.length > 0 || !props.containerFetched ? 
						renderFiles() : <h3>There are no blobs in this container</h3>}
					{renderCreateForm()}
				</div>
			}
		</div>
	)	
}

ContainerContent.propTypes = {
	files: PropTypes.array,
	loading: PropTypes.bool,
	containerId: PropTypes.string,
	errorMessage: PropTypes.string,
	containerFetched: PropTypes.bool,

	fetchContent: PropTypes.func,
	createBlob: PropTypes.func,
	deleteBlob: PropTypes.func,
}

export default ContainerContent