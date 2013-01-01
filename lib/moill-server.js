/*
This contains the actual server.  I made it an object only so that the
tests could use it.
*/
var config = require('./moill-config');
var http = require('http');
var moillActions = require('./moill-actions');
var nodeStatic = require('node-static');
var url = require('url');

function MoillServer() {
    //Global map of linked lists.  This should, of course go to some datastore
    // at some point.  In memory for now.
    var _ills = {};
    var TEST_PORT = 8111;
    var _port = config.port;
    
    //Now the server
    var _file = new(nodeStatic.Server)('./static');
    var _server = http.createServer(function(request, response) {
	console.log("Handling request: " + request.url);
	var uparts = url.parse(request.url, true);
	//If the request is under moill, send it to moill.
	if (uparts.pathname.indexOf("/moill") == 0) {
	    moillActions.handleRequest(request, response, uparts, _ills);
	}
	else {
	    //Otherwise, serve out of static.
	    _file.serve(request, response, function (e, res) {
		if (e && (e.status === 404)) { // If the file wasn't found
		    //Originally I just served up the index instead:
		    // file.serveFile('/index.html', 404, {}, request, response);
		    // but then I started thinking about relative paths.
		    response.writeHead("302", "Moved Temporarily", {
			"Location": "/index.html",
			"content-type": "text/plain"
		    });
		    response.end("404: Redirecting you to the index...");
		}
	    });
	}
    });

    this.start = function() {
	console.log("Starting server on default port " + config.port);
	_server.listen(_port);
    }

    this.startTestServer = function() {
	_port = TEST_PORT;
	console.log("Starting server on port " + _port);
	_server.listen(_port);
    }

    this.getPort = function() {
	return _port;
    }

    this.close = function() {
	_server.close();
    }
}

exports.MoillServer = MoillServer;
