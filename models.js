module.exports = {

	/**
	* Encapsulates information about one tile position
	* @param int - row
	* @param int - column
	*/
	Position: function( row, column ){
		this.row = row;
		this.column = column;
	},

	/**
	* Encapsulates information about one player
	* @param string - avatar
	* @param bool - is_human
	* @param int - moves_remaining
	*/
	Player: function( avatar, is_human, moves_remaining ){
		this.type = "player";
		this.avatar = avatar;
		this.UID = Math.random();
		this.is_human = is_human;
		this.status = "OK"; 
		this.moves_remaining = moves_remaining;
		this.score = 0;
	},

	/**
	* Encapsulates information about one player's move
	* @param UID
	* @param string - "up", "down", "left", "right", "bomb"
	*/
	PlayerMove: function( UID, type ){

		this.type = type;
		this.UID = UID;

	},

	/**
	* The representation of a player on the field
	* @param UID
	* @param string - avatar
	*/
	PlayerTile: function( UID, avatar ){
		this.type = "player";
		this.UID = UID;
		this.avatar = avatar;
	},

	/**
	* The representation of an empty tile
	*/
	FloorTile: function(){
		this.type = "floor";
	},

	/**
	* The representation of a bomb on the field
	* @param int - turns_remaining
	*/
	BombTile: function( turns_remaining ){
		this.type = "bomb";
		this.turns_remaining = turns_remaining;
	}

};
