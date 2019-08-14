import React from "react"
import { Link, NavLink } from "react-router-dom"
import PropTypes from "prop-types"

import classes from "./Header.scss"
import Cody from "./cody.svg"

export const Header = ({ isLoggedIn, userInitials }) => (
	<header className={classes.header}>
		<Link to="/" title="Home" className={classes.homeLink}>
			<img src={Cody} alt="Cody the space dog"/>
		</Link>
		<nav className={classes.nav}>
			<NavLink to="/user" activeClassName={classes.active}>User</NavLink>
		</nav>
		{isLoggedIn && (
			<Link to="/user" className={classes.user}>
				<span>{userInitials}</span>
			</Link>
		)}
		{!isLoggedIn && (
			<a href="/login">Log in</a>
		)}
	</header>
)
Header.propTypes = {
	isLoggedIn: PropTypes.bool,
	userInitials: PropTypes.string
}
Header.defaultProps = {
	isLoggedIn: false,
	userInitials: ""
}
export default Header