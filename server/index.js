"use strict";

var http = require('http'),
	path = require('path'),
	FileHunter = require('./file-server/file-hunter');

function replaceValues(from, to) {

	var merge = {},
		key;

	for (key in to) {
		if (to.hasOwnProperty(key)) {
			merge[key] = from.hasOwnProperty(key) ? from[key] : to[key];
		}
	}

	return merge;

}

function Server(userConfigArg) {

	var server = this;

	server.attr = {
		httpServer: null,
		config: null
	};

	server.initialize(userConfigArg);

}

Server.prototype.initialize = function (userConfigArg) {

	var config, fileHunter, server, httpServer;

	server = this;

	config = replaceValues(userConfigArg || {}, require('./file-server/defaults-config'));

	fileHunter = new FileHunter({
		root: path.normalize([process.cwd(), config.root].join(path.sep)),
		page404: config.page404
	});

	httpServer = new http.createServer(function (req, res) {
		fileHunter.find(req, res, null, fileHunter.send);
	});

	server.attr.httpServer = httpServer;
	server.attr.config = config;

};

Server.prototype.run = function () {

	var serverAttr = this.attr;

	serverAttr.httpServer.listen(serverAttr.config.port);

	console.log('server started');

};

module.exports = Server;
