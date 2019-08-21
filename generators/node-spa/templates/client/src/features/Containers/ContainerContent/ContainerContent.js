/* eslint-disable no-mixed-spaces-and-tabs */
import React, { useEffect } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import BlobItem from "./BlobItem"
import AddBlobItem from "./AddBlobItem"

import classes from "./ContainerContent.scss"

const ContainerContent = (props) => {
	useEffect(() => {
		if(!props.containerFetched) {
			props.fetchContent()
		}
	}, [])

	const renderFiles = () => (
		props.files.map(blob => (
			<BlobItem key={blob.name} containerId={props.match.params.id} blob={blob} />			
		))
	)

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
					<AddBlobItem containerId={props.match.params.id} />
				</div>
			}
		</div>
	)	
}

ContainerContent.propTypes = {
	files: PropTypes.array,
	loading: PropTypes.bool,
	errorMessage: PropTypes.string,
	containerFetched: PropTypes.bool,
	match: PropTypes.object,

	fetchContent: PropTypes.func,
}

export default ContainerContent