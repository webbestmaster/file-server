var http = require('http');
var path = require('path');
var fs = require('fs');

var fileHunter = require('./file-hunter');

fileHunter.root = path.normalize([__dirname, '..', 'files'].join(path.sep));

var server = new http.createServer(function (req, res) {

	fileHunter.find(req, res, null, fileHunter.send);

});

server.listen(3000);


