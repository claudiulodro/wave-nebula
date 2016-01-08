var express = require( 'express' );
var path = require( 'path' );
var controller = require( './controller' );
var util = require( './util' );

var app = express();
app.use( express.static( 'public' ) );

controller.init();
controller.addHuman( "Claud", "orange" );

/**
* Serve the game page
*/
app.get( '/', function( req, res ) {
  	res.sendFile(path.join(__dirname, '/public', 'game.html'));
});

/**
* Move the bot around
* @return JSON
*/
app.get( '/api/shufflebots', function( req, res ) {
	controller.shuffleBots();
	res.send( util.sendSuccess( [] ) );
});

/**
* Move a player around
* @param in req - UID
* @param in req - direction
* @return JSON
*/
app.get( '/api/moveplayer', function( req, res ) {
	
	if( typeof req.query === 'undefined' || typeof req.query.UID === 'undefined' || typeof req.query.direction === 'undefined' ){
		res.send( util.sendError( "Missing parameters" ) );
		return;
	}

	var UID = req.query.UID;
	var direction = req.query.direction;

	controller.enqueueMove( UID, direction );
	res.send( util.sendSuccess( [] ) );

});

/**
* Drop a bomb
* @param in req - UID
* @return JSON
*/
app.get( '/api/dropbomb', function( req, res ) {

	if( typeof req.query === 'undefined' || typeof req.query.UID === 'undefined' ){
		res.send( util.sendError( "Missing parameters" ) );
		return;
	}

	controller.enqueueMove( req.query.UID, "bomb" );

	res.send( util.sendSuccess( [] ) );
});

/**
* Get the state of the current game
* @return JSON
*/
app.get( '/api/gamestate', function( req, res ) {
	var data = controller.getData();
	res.send( util.sendSuccess( data ) );
});

var server = app.listen( 8081, function() {

	var host = server.address().address;
	var port = server.address().port;

	console.log( "Server listening at http://%s:%s", host, port );

});
