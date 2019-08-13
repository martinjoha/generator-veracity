import React from "react"
import PropTypes from "prop-types"
 
import classes from "../Containers.scss"

export const ImageBlob = (props) => {

	return(
		<div className={classes.container}>
			<h3>{props.blob.name}</h3>
			<img src={props.blob.content} />
		</div>
	)
}

ImageBlob.propTypes = {
	blob: PropTypes.object
}

export default ImageBlob