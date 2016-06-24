module.exports = {

	port: 3000, // used

	root: 'www', // used
	
	onRequest: function (req, res, err, cb) {
		console.log('I am onRequest');
		cb();
	},

	page404: function (req, res, err) { // used
		console.error('Not Found:', err);
		res.statusCode = 404;
		res.end('404 - Not Found');
	}

};
