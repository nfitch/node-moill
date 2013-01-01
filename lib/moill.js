/*
Just starts the server.  Since the server was encapsulated, this acts as
"main".
*/
var MoillServer = require('./moill-server').MoillServer;
var server = new MoillServer();
server.start();