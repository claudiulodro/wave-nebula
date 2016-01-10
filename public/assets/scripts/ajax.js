var EventHandler = $( window );

function getAvatars(){

	$.get( "api/avatars", 
		{}, 
		function( response ) {
			console.log( "Avatar state: " );
			console.log( response );
			EventHandler.trigger( "avatars-fetched", response );
		}
	);

}

function addPlayer( avatar ){

	$.get( "api/addplayer", 
		{ 
			avatar: avatar, 
		}, 
		function( response ) {
			console.log( response );			
			EventHandler.trigger( "player-added", response );
		}
	);

}

function sendMove( UID, direction ){

	$.get( "api/moveplayer", 
		{ 
			UID: UID, 
			direction: direction
		}, 
		function( response ) {
			console.log( response );
		}
	);

}

function sendBomb( UID ){
console.log( "SENDING BOMB FOR UID: " + UID );
	$.get( "api/dropbomb",
		{
			UID: UID
		},
		function( response ) {
			console.log( response );
		}
	);

}

function shuffleBots(){

	$.get( "api/moveplayer", 
		{}, 
		function( response ) {
			console.log( response );
		}
	);

}

function getGameState(){

	$.get( "api/gamestate", 
		{}, 
		function( response ) {
			console.log( "GAME STATE: " );
			console.log( response );
			EventHandler.trigger( "board-refresh", response );
		}
	);

}
