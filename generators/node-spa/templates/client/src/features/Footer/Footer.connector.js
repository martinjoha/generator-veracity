import { connect } from "react-redux"
import Footer from "./Footer"

export default connect(() => ({
	copyrightTo: "<%= companyName || userName %>"
}))(Footer)