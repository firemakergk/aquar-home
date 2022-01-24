#!/usr/bin/env node

/**
 * Module dependencies.
 */

import fs from 'fs'
import app from './app.js'
import SocketServer from './socket.js'
import debug from 'debug'
import https from 'https'
debug('demo:server')

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '8172');
// app.set('port', port);

/**
 * Create HTTP server.
 */
const options = {
  key: fs.readFileSync('./cert/aquar.key'),
  cert: fs.readFileSync('./cert/aquar.crt')
};
var server = https.createServer(options,app.callback());
var socketServer = new SocketServer(server);
/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
