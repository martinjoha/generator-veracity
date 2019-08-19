import React, {  useEffect } from "react"
import PropTypes from "prop-types"
import classes from "./Containers.scss"
import Container from "./Container"

const Containers = (props) => {
	useEffect(() => {
		if(!props.containersFetched) {
			props.fetchContainers()
		}
	})
	const renderContainers = () => (
		props.containers.map(container => (
			<Container container={container} key={container.id} />
		))
	)
	if(props.errorMessage) {
		return (
			<div className={classes.container}>
				{props.errorMessage}
			</div>
		)
	}
	return (
		<div>
			{(props.loading || !props.containersFetched) ? <div className={classes.container}>Loading...</div> :
				<div className={classes.container}>
					{props.containers.length === 0 ? <div>You have no containers</div> : renderContainers()}
				</div>
			}
		</div>
	)
}


Containers.propTypes = {
	containers: PropTypes.array,
	loading: PropTypes.bool,
	errorMessage: PropTypes.string,
	containersFetched: PropTypes.bool,

	fetchContainers: PropTypes.func,
}
export default Containers