import { connect } from "react-redux"
import Footer from "./Footer"

export default connect(() => ({
	copyrightTo: "DNV GL"
}))(Footer)