"use strict";

var http = require('http');
var path = require('path');
// var fs = require('fs');
var FileHunter = require('./file-server/file-hunter');

var config = (function () {

	var userConfig = require('./user-config'),
		defaultsConfig = require('./file-server/defaults-config'),
		config = {},
		key;

	for (key in defaultsConfig) {
		if (defaultsConfig.hasOwnProperty(key)) {
			config[key] = userConfig.hasOwnProperty(key) ? userConfig[key] : defaultsConfig[key];
		}
	}

	return config;

}());

var fileHunter = new FileHunter({
	root: path.normalize([__dirname, '..', config.root].join(path.sep)),
	page404: config.page404
});

var server = new http.createServer(function (req, res) {

	fileHunter.find(req, res, null, fileHunter.send);

});

server.listen(config.port);
