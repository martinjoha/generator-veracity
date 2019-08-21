import React from "react"
import PropTypes from "prop-types"

import * as classes from "../ContainerContent.scss"

export const BlobItem = ({ blob, isDeleting, deleteBlob }) => {
	return(
		<div className={classes.blob} key={blob.name}>
			<a href={blob.url} target="_blank" rel="noopener noreferrer">
				<h3 key={blob.name}>Blob name: {blob.name}</h3>
			</a>
			<div>
				<button 
					id={blob.name} 
					onClick={e => deleteBlob(e.target.id)} 
					disabled={isDeleting}>Delete blob</button>
			</div>
		</div>
	)
}

export default BlobItem

BlobItem.propTypes = {
	blob: PropTypes.object.isRequired,
	isDeleting: PropTypes.bool.isRequired,

	deleteBlob: PropTypes.func.isRequired
}