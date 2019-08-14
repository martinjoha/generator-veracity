module.exports = (req, res) => {
	if(req.user) {
		return {
			user: {
				authenticated: true
			}
		}
	}
}