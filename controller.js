var models = require( './models' );

/**
* TODO: Add score to playertiles
*/

module.exports = {

	BOARD_WIDTH: 10,
	BOARD_HEIGHT: 10,
	BOMB_TURNS: 3,
	ROUND_LENGTH: 15,
	NUM_PLAYER_MOVES: 3,
	NUM_BOTS: 3,
	

	timer: 0,
	tiles: [],
	players: [],
	moves: [],
	bombs: [],
	avatars: [ 
		new models.Avatar(1),
		new models.Avatar(2),
		new models.Avatar(3),
		new models.Avatar(4),
		new models.Avatar(5),
		new models.Avatar(6),
		new models.Avatar(7),
		new models.Avatar(8),
		new models.Avatar(9)
	 ],

	/**
	* Get the game going
	*/
	init: function(){

		this.makeBoard();
		this.makeBots();
		this.timer = this.ROUND_LENGTH;
		setInterval( function(){
			--module.exports.timer;
			if( module.exports.timer <= 0 ){
				module.exports.nextRound();
			}
		}, 1000 );
	},

	/**
	* End the current round and get the next one started
	*/
	nextRound: function(){

		this.shuffleBots();
		this.doAllMoves();
		this.processCurrentBombs();
		this.addNewBombs();

		this.timer = this.ROUND_LENGTH;

		for( var i = 0; i < this.players.length; ++i ){

			if( this.players[i].status == "dead" ){

				//Free up their avatar
				for( var j = 0; j < this.avatars.length; ++j ){
					if( this.players[i].avatar == this.avatars[j].id ){
						this.avatars[j].available = true;
						break;
					}
				}

				//Remove the old player from the list
    				this.players.splice(i, 1);
			}
			else {
				this.players[i].moves_remaining = this.NUM_PLAYER_MOVES;
				var tile_position = this.getTileByPlayer( this.players[i].UID );
				if( tile_position ){
					++this.players[i].score;
					this.tiles[tile_position.row][tile_position.column].score = this.players[i].score;
				} 
				else {
					this.players[i].status = "dead";
				}
			}
		}

		this.repopulateBots();

	},

	repopulateBots: function(){
		var existing_bots = 0;
		for( var i = 0; i < this.players.length; ++i ){
			if( !this.players[i].is_human ){
				++existing_bots;
			}
		}

		var needed_bots = this.NUM_BOTS - existing_bots;

		if( needed_bots > 0 ){
			for( var i = 0; i < needed_bots; ++i ){

				var available_avatars_exist = false;

				for( var j = 0; j < this.avatars.length; ++j ){
					if( this.avatars[j].available ){
						available_avatars_exist = true;
						break;
					}
				}

				if( available_avatars_exist ){
					var bot_avatar = Math.floor( ( Math.random() * this.avatars.length ) );
					while( !this.avatars[bot_avatar].available ){
						bot_avatar = Math.floor( ( Math.random() * this.avatars.length ) );
					}
					this.addBot( bot_avatar );
				}
			}
		}
	},

	/**
	* Add a move to the move queue
	* @param UID of player to move
	* @param string - "down", "left", "up", "right", or "bomb"
	*/
	enqueueMove: function( UID, type ){
		var player = this.getPlayerByUID( UID );
		if( !player || player.status != "OK" ){
			return false;
		}

		if( player.moves_remaining > 0 ){
			this.moves.push( new models.PlayerMove( UID, type ) );
			--player.moves_remaining;
			return true;
		}
		
		return false;

	},

	/**
	* Get the first move in the move queue
	* @return PlayerMove object or null if queue is empty
	*/
	dequeueMove: function(){

		if( !this.hasMoves() ){
			return null;
		}

		return this.moves.shift();
	},

	/**
	* Do we have any bombs waiting in the bomb queue?
	* @return bool
	*/
	hasBombs: function(){
		return this.bombs.length > 0;
	},

	/**
	* Enqueue a bomb to the bomb queue
	* @param Position object where bomb goes
	*/
	enqueueBomb: function( position ){
		this.bombs.push( position );
	},

	/**
	* Get the first bomb in the queue
	* @return Position object or null if queue is empty
	*/
	dequeueBomb: function(){
		if( !this.hasBombs() ){
			return null;
		}

		return this.bombs.shift();
	},

	/**
	* Add all bombs from the bomb queue to the board
	*/
	addNewBombs: function(){

		while( this.hasBombs() ){
			this.dropBomb( this.dequeueBomb() );
		}
	},

	/**
	* Process and expand or remove all bombs that are already on the board
	*/
	processCurrentBombs: function(){ 

		var expandedBombs = [];
		var tile_position = null;
		var tile = null;

		for( var i = 0; i < this.BOARD_WIDTH; ++i ){
			for( var j = 0; j < this.BOARD_HEIGHT; ++j ){

				tile_position = new models.Position( j, i );
				tile = this.tileAt( tile_position );
				if( tile.type != "bomb" ){
					continue;
				}

				--tile.turns_remaining;
				if( tile.turns_remaining <= 0 ){
					this.updateBoard( tile_position, new models.FloorTile() );
					continue;
				} 

				expandedBombs.push( {
					position: new models.Position( tile_position.row, tile_position.column ),
					tile: new models.BombTile( tile.turns_remaining )
				} );
				
				if( tile.turns_remaining > 1 ){

					if( tile_position.row < this.BOARD_HEIGHT - 1 ){
						expandedBombs.push( {
							position: new models.Position( tile_position.row + 1, tile_position.column ),
							tile: new models.BombTile( tile.turns_remaining )
						} );
					}

					if( tile_position.column < this.BOARD_WIDTH - 1 ){
						expandedBombs.push( {
							position: new models.Position( tile_position.row, tile_position.column + 1 ),
							tile: new models.BombTile( tile.turns_remaining )
						} );
					}

					if( tile_position.row > 0 ){
						expandedBombs.push( {
							position: new models.Position( tile_position.row - 1, tile_position.column ),
							tile: new models.BombTile( tile.turns_remaining )
						} );
					}
				
					if( tile_position.column > 0 ){
						expandedBombs.push( {
							position: new models.Position( tile_position.row, tile_position.column - 1 ),
							tile: new models.BombTile( tile.turns_remaining )
						} );
					}
				}

				if( tile.turns_remaining == 1 ){

					if( tile_position.row < this.BOARD_HEIGHT - 1 && tile_position.column < this.BOARD_WIDTH - 1 ){
						expandedBombs.push( {
							position: new models.Position( tile_position.row + 1, tile_position.column + 1 ),
							tile: new models.BombTile( tile.turns_remaining )
						} );
					}

					if( tile_position.column > 0 && tile_position.row > 0 ){
						expandedBombs.push( {
							position: new models.Position( tile_position.row - 1, tile_position.column - 1 ),
							tile: new models.BombTile( tile.turns_remaining )
						} );
					}

					if( tile_position.row > 0 && tile_position.column < this.BOARD_WIDTH - 1 ){
						expandedBombs.push( {
							position: new models.Position( tile_position.row - 1, tile_position.column + 1 ),
							tile: new models.BombTile( tile.turns_remaining )
						} );
					}

					if( tile_position.row < this.BOARD_HEIGHT - 1 && tile_position.row > 0 ){
						expandedBombs.push( {
							position: new models.Position( tile_position.row + 1, tile_position.column - 1 ),
							tile: new models.BombTile( tile.turns_remaining )
						} );
					}

				}
			}

		}

		for( var i = 0; i < expandedBombs.length; ++i ){
			this.updateBoard( expandedBombs[i].position, expandedBombs[i].tile );
		}
	},

	/**
	* Are there any moves in the move queue?
	* @return bool
	*/
	hasMoves: function(){
		return this.moves.length > 0;
	},
	
	/**
	* Process one move
	* @param playerMove object
	*/
	processMove: function( playerMove ){


		if( playerMove.type == "bomb" ){
			var position = this.getTileByPlayer( playerMove.UID );
			if( position ){
				this.enqueueBomb( position );
			}
		}
		else {
			this.movePlayer( playerMove.UID, playerMove.type );
		}

	},

	/**
	* Process all moves waiting in the move queue
	*/
	doAllMoves: function(){
			
		while( this.hasMoves() ){
			this.processMove( this.dequeueMove() );
		}

	},

	/**
	* Drop a new bomb onto the board
	* 
	*/
	dropBomb: function( position ){

		var tile = new models.BombTile( this.BOMB_TURNS );
		this.updateBoard( position, tile );
	},

	/**
	* Get the board
	* @return matrix of Tile objects
	*/
	getBoard: function(){
		return this.tiles;
	},
	
	/**
	* Get the currently active players
	* @return array of Player objects
	*/
	getPlayers: function(){	
		return this.players;
	},

	/**
	* Get the time left in the current round
	* @return int: Time left in current round
	*/
	getTimer: function(){
		return this.timer;
	},

	/**
	* Get the avatars and their availability
	* @return array of Avatar objects
	*/
	getAvatars: function(){
		return this.avatars;
	},

	/**
	* Get all the game information
	* @return - object: All available game info
	*/ 
	getData: function(){

		return {
			tiles: this.getBoard(),
			players: this.getPlayers(),
			timer: this.getTimer(),
			avatars: this.getAvatars()
		}

	},

	/**
	* Build the starting board
	*/
	makeBoard: function(){
		this.tiles = [];

		for( var i = 0; i < this.BOARD_HEIGHT; ++i ){
			var row = [];
			for( var j = 0; j < this.BOARD_WIDTH; ++j ){
				row.push( new models.FloorTile() );
			}
			this.tiles.push( row );
		}
	},

	/**
	* Add the starting bots to the game
	*/
	makeBots: function(){
		this.players = [];
		
		this.addBot( 1 );
		this.addBot( 2 );
		this.addBot( 3 );
	},

	/**
	* Find a random, unused tile on the board
	* @return Position object
	*/
	getRandomPosition: function(){

		var row_pos = Math.floor( ( Math.random() * this.BOARD_HEIGHT ) );
		var column_pos = Math.floor( ( Math.random() * this.BOARD_WIDTH ) );
		var position = new models.Position( row_pos, column_pos );

		while( this.tileAt( position ).type !== 'floor' ){
			row_pos = Math.floor( ( Math.random() * this.BOARD_HEIGHT ) );
			column_pos = Math.floor( ( Math.random() * this.BOARD_WIDTH ) );
			position = new models.Position( row_pos, column_pos );
		}

		return position;
	},

	/**
	* Add a player to the game
	* @param avatar - String: The avatar of the player 
	* @param is_human - Bool: Computer or player controlled player
	* @return UID on success, false on fail
	*/
	addPlayer: function( avatar, is_human ){

		for( var i = 0; i < this.avatars.length; ++i ){
			if( this.avatars[i].id == avatar && this.avatars[i].available ){

				var player = new models.Player( avatar, is_human, this.NUM_PLAYER_MOVES );

				this.players.push( player ); 

				var tile = new models.PlayerTile( player.UID, player.avatar );

				this.updateBoard( this.getRandomPosition(), tile ); 

				this.avatars[i].available = false;

				return player.UID;
			}
		}

		return false;
	},

	/**
	* Add a computer-controlled player to the game
	* @param avatar - String: The avatar of the player
	*/
	addBot: function( avatar ){
		console.log( "ADDING BOT WITH AVATAR: " + avatar );
		return this.addPlayer( avatar, false );
	},

	/**
	* Add a human-controlled player to the game
	* @param avatar - String: The avatar of the playe
	*/
	addHuman: function( avatar ){
		return this.addPlayer( avatar, true );
	},

	/**
	* Get a tile
	* @param position - Position object: Position of tile to get
	* @return Tile object
	*/
	tileAt: function( position ){
		return this.tiles[position.row][position.column];
	},

	/**
	* Set a tile on the board
	* @param position - Position object: Position of tile to set
	* @param tile - Tile object: Tile to set
	*/
	updateBoard: function( position, tile ){
		this.tiles[position.row][position.column] = tile;
	},

	/**
	* Move a tile on the board
	* @param start_position - Position object: the tile position of the tile to move
	* @param end_position - Position object: where to move the tile to
	*/
	moveTile: function( start_position, end_position ){
		this.updateBoard( end_position, this.tileAt( start_position ) );
		this.updateBoard( start_position, new models.FloorTile() );
	},

	/**
	* Move a player one space in any direction
	* @param UID - A player's UID
	* @param direction - String: "up", "down", "left", "right"
	* @return true on success, false on fail
	*/
	movePlayer: function( UID, direction ){
		
		var start_position = this.getTileByPlayer( UID );
		if( !start_position ){
			return false;
		}

		var end_position = new models.Position( start_position.row, start_position.column );

		if( direction == "up" ){
			if( end_position.row <= 0 ){
				return false;
			}
			--end_position.row;
		}
		else if( direction == "left" ){
			if( end_position.column <= 0 ){
				return false;
			}
			--end_position.column;
		}
		else if( direction == "right" ){
			if( end_position.column >= this.BOARD_WIDTH - 1 ){
				return false;
			}
			++end_position.column;
		}
		else if( direction == "down" ){
			if( end_position.row >= this.BOARD_HEIGHT - 1 ){
				return false;
			}
			++end_position.row;
		}
		else{
			return false;
		}

		this.moveTile( start_position, end_position );

		return true;
	},

	/**
	* Get the player object at a position
	* @param position - Position object
	* @return Player object or false on fail
	*/
	getPlayerByTile: function( position ){

		var tile = this.tileAt( position );

		if( tile.type != "player" ){
			return false;
		}		

		for( var i = 0; i < this.players.length; ++i ){
			if( this.players[i].UID == tile.UID ){
				return this.players[i];
			}
		}
			
		return false;
	},

	/**
	* Get the player object by UID
	* @param UID - The UID of the player to match
	* @return Player object or false on fail
	*/
	getPlayerByUID: function( UID ){

		var players = this.getPlayers();

		for( var i = 0; i < players.length; ++i ){
			if( players[i].UID == UID ){
				return players[i];
			}
		}

		return false;

	},

	/**
	* Get the position of a player tile by player
	* @param UID - The UID of the player to match
	* @return Position object or false on fail
	*/
	getTileByPlayer: function( UID ){

		for( var i = 0; i < this.BOARD_WIDTH; ++i ){
			for( var j = 0; j < this.BOARD_HEIGHT; ++j ){
				var tile = this.tileAt( new models.Position( j, i ) );

				if( tile.type == "player" && tile.UID == UID ){
					return new models.Position( j, i );
				}
			}
		}

		return false;
	},

	/**
	* Do some random moves for the bots
	*/
	shuffleBots: function(){
			
		var bots = [];
		var players = this.getPlayers();

		for( var i = 0; i < players.length; ++i ){
			if( !players[i].is_human ){
				bots.push( players[i] );
			}
		}
console.log( "SHUFFLING " + bots.length + " BOTS" );
		var possibleMoves = [ "up", "down", "left", "right", "up", "down", "left", "right", "bomb" ];

		for( var i = 0; i < bots.length; ++i ){

			//enqueue 3 random moves picked from possibleMoves
			for( var j = 0; j < this.NUM_PLAYER_MOVES; ++j ){
				var move = Math.floor( ( Math.random() * possibleMoves.length ) );
				this.enqueueMove( bots[i].UID, possibleMoves[move] );
			}

		}
		this.doAllMoves();
	}

};

