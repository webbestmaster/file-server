var http = require('http');
var path = require('path');
pathSep = path.sep;
var url = require('url');
var fs = require('fs');
var mime = require('mime-types');

var fileFolderPath = 'files';

var fileRootPath = path.normalize([__dirname, '..', fileFolderPath].join(pathSep));

function writeFileToResponse(path, res) {

	var file = new fs.ReadStream(path);

	file.pipe(res);

	file.on('error', function (err) {
		console.error('Not Found:', err);
		res.statusCode = 404;
		res.end('404 - Not Found');
	});

	// set mime type
	res.setHeader('Content-Type', mime.lookup(path));

	// client close connection
	// close - this is error for res
	// finish - is normal for res
	res.on('close', function () {
		file.destroy();
	});

	// return file cause programmer may be want add more listeners to stream
	return file;

}

var server = new http.createServer(function (req, res) {

	var reqUrl = url.parse(req.url);
	var pathName = path.normalize(fileRootPath + pathSep + reqUrl.pathname);

	// detect file or folder
	fs.stat(pathName, function (err, fileInfo) {

		if (err) {

			if (req.headers.referer) {
				var urlPathName = url.parse(req.headers.referer).pathname;
				var newPathName = path.normalize(fileRootPath + pathSep + urlPathName + pathSep + reqUrl.pathname);

				fs.stat(newPathName, function (err, fileInfo) {

					if (err) {
						console.error('Not Found:', err);
						res.statusCode = 404;
						res.end('404 - Not Found');
						return;
					}


					// if path walk to directory - add /index.html to end ot the path
					if (fileInfo.isDirectory()) {
						newPathName = path.normalize(newPathName + pathSep + 'index.html');
					}

					return writeFileToResponse(newPathName, res);


				});

			} else {
				console.error('Not Found:', err);
				res.statusCode = 404;
				res.end('404 - Not Found');

			}










			return;
		}

		// if path walk to directory - add /index.html to end ot the path
		if (fileInfo.isDirectory()) {
			pathName = path.normalize(pathName + pathSep + 'index.html');
		}

		return writeFileToResponse(pathName, res);

	});

});

server.listen(3000);


