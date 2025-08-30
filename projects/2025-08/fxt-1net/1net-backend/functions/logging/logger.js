// Log messages with timestamp
function logger(message) {
	const timestamp = new Date().toISOString();
	console.log(`[${timestamp}] ${message}`);
}

export default logger;