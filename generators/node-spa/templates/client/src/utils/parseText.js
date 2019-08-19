export const createAppendText = (text) => {
	const now = new Date().toISOString()
	return `${now}, ${text}`
}