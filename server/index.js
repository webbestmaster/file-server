"use strict";

var http = require('http');
var path = require('path');
var fs = require('fs');
var FileHunter = require('./file-hunter');
var fileHunter = new FileHunter();

var config = (function () {

	var userConfig = require('./user-config'),
		defaultsConfig = require('./defaults-config'),
		config = {},
		key;

	for (key in defaultsConfig) {
		if (defaultsConfig.hasOwnProperty(key)) {
			config[key] = userConfig.hasOwnProperty(key) ? userConfig[key] : defaultsConfig[key];
		}
	}

	return config;

}());

fileHunter.root = path.normalize([__dirname, '..', config.root].join(path.sep));
fileHunter.page404 = config.page404;
fileHunter.send = fileHunter.send.bind(fileHunter);

var server = new http.createServer(function (req, res) {

	fileHunter.find(req, res, null, fileHunter.send);

});

server.listen(config.port);
