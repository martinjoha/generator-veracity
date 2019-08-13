import React from "react"
import PropTypes from "prop-types"

import classes from "./Container.scss"
import { Link } from "react-router-dom"


const Container = (props) => {

	const renderContainer = () => {
		return (
			<table>
				<tbody>
					{ Object.entries(props.container).map(entry => {
						return (
							<tr key={entry[0]}>
								<td>{entry[0]}</td>
								<td style={{ "paddingLeft": "10px" }}>{entry[1]}</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		)}

	return (
		<Link to={`/containers/${props.container.id}`} className={classes.link} onClick={props.currentContainer !== props.container.id ? props.unsetBlobs : null}>
			<div className={classes.card}>
				{renderContainer()}
			</div>
		</Link>
	)
}

Container.propTypes = {
	container: PropTypes.object,
	currentContainer: PropTypes.string,
	
	unsetBlobs: PropTypes.func,
}

export default Container