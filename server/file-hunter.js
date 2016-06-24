var url = require('url');
var fs = require('fs');
var path = require('path');
var pathSep = path.sep;
var mime = require('mime-types');
var zlib = require('zlib');

function FileHunter() {

	var fileHunter = this;

	fileHunter.root = '';

}

FileHunter.prototype.find = function (req, res, err, cb) {

	// FIXME: add here check for err if needed
	var fileHunter = this,
		reqUrl = url.parse(req.url),
		pathName = path.normalize(fileHunter.root + pathSep + reqUrl.pathname);

	// detect file or folder
	fs.stat(pathName, function (err, fileInfo) {

		if (err) {

			if (req.headers.referer) {
				var referer = url.parse(req.headers.referer).pathname,
					refPathName = path.normalize(fileHunter.root + pathSep + referer + pathSep + reqUrl.pathname);

				fs.stat(refPathName, function (err, fileInfo) {

					if (err) {
						return cb(req, res, err, null);
					}

					// if path walk to directory - add /index.html to end ot the path
					if (fileInfo.isDirectory()) {
						refPathName = path.normalize(refPathName + pathSep + 'index.html');
					}

					cb(req, res, null, refPathName);

				});

			} else {
				cb(req, res, err, null);
			}

			return;

		}

		// if path walk to directory - add /index.html to end ot the path
		if (fileInfo.isDirectory()) {
			pathName = path.normalize(pathName + pathSep + 'index.html');
		}

		cb(req, res, null, pathName);

	});

};

FileHunter.prototype.send = function (req, res, err, path) {

	var fileHunter = this;

	if (err) {
		fileHunter.page404(req, res, err);
		return;
	}

	var file = 	new fs.ReadStream(path),
		acceptEncoding = req.headers['accept-encoding'] || '';

	// set mime type
	res.setHeader('Content-Type', mime.lookup(path));

	// Note: this is not a conformant accept-encoding parser.
	// See http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3
	if ((/\bdeflate\b/).test(acceptEncoding)) {
		res.setHeader('Content-Encoding', 'deflate');
		file.pipe(zlib.createDeflate()).pipe(res);
	} else if ((/\bgzip\b/).test(acceptEncoding)) {
		res.setHeader('Content-Encoding', 'gzip');
		file.pipe(zlib.createGzip()).pipe(res);
	} else {
		file.pipe(res);
	}

	file.on('error', function (err) {
		fileHunter.page404(req, res, err);
	});

	// client close connection
	// close - this is error for res
	// finish - is normal for res
	res.on('close', function () {
		file.destroy();
	});

};

module.exports = FileHunter;
