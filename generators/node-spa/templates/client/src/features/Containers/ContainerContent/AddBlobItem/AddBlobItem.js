import React, { useState } from "react"
import PropTypes from "prop-types"

import * as classes from "../ContainerContent.scss"

export const AddBlobItem = ({ isCreatingBlob, createBlob }) => {
	const [newBlobName, setNewBlobName] = useState("")
	const [newBlobText, setNewBlobText] = useState("")
	
	const createNewBlob = () => {
		createBlob(newBlobName, newBlobText, "text/plain")
		setNewBlobName("")
		setNewBlobText("")
	}

	return(
		<div className={classes.form}>
			<form>
				<input type="text" placeholder="Name of your new blob" onChange={(e) => setNewBlobName(e.target.value)} value={newBlobName} />
				<input type="text" placeholder="Enter some text" onChange={e => setNewBlobText(e.target.value)} value={newBlobText} />
			</form>
			<button onClick={createNewBlob} disabled={isCreatingBlob}>Create Blob</button>
		</div>
	)
} 

export default AddBlobItem

AddBlobItem.propTypes = {
	isCreatingBlob: PropTypes.bool.isRequired,

	createBlob: PropTypes.func.isRequired
}