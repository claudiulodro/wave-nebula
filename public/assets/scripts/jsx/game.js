/**
* FRONTEND TODO:
* Player join/select
* Move limit
* Lose messages
* Score visual
* Countdown visual
* Used moves visual
* CSS
*/

/**
* One tile on the field
*/
var Tile = React.createClass({

	render: function(){

		var classes = "tile " + this.props.data.type;
		var style = {};

		if( this.props.data.type == "player" ){
			 //TODO add avatar to classes
		}

		return (
			<div className={classes} style={style}>
				&nbsp;
			</div>
		);

	}

});

/**
* One row of Tiles
*/
var Row = React.createClass({

	render: function(){

		return (
			<div className="row">
				{ 
					this.props.tiles.map( function( tile, i ){
						return <Tile data={tile} />
					})
				}
			</div>
		);

	}

});

/**
* The game board
*/
var Board = React.createClass({

	render: function(){

		if( typeof this.props === 'undefined' || typeof this.props.rows === 'undefined' ){
			return (
				<div className="board"></div>
			);
		}

		return (
			<div className="board">
				{
					this.props.rows.map( function( row, i ){
						return <Row tiles={row} />
					})
				}
			</div>
		);
	}

});

/**
* A button for making directional moves
*/
var ControlButton = React.createClass({

	onClicked: function(){
		
		if( this.props.UID == null ){
			return;
		}

		sendMove( this.props.UID, this.props.direction );
	},

	render: function(){
		var classes = "control-button " + this.props.direction;		

		return (
			<div className={classes} onClick={this.onClicked} >
				{this.props.direction}
			</div>
		);
	}
	
});

/**
* A button for dropping bombs
*/
var BombButton = React.createClass({

	onClicked: function(){
		
		if( this.props.UID == null ){
			return;
		}

		sendBomb( this.props.UID );
	},

	render: function(){
		var classes = "control-button bomb";		

		return (
			<div className={classes} onClick={this.onClicked} >
				Bomb
			</div>
		);
	}	

});

/**
* The player controls
*/
var Controls = React.createClass({
	render: function(){

		return (
			<div className="controls">
				<ControlButton UID={this.props.player.UID} direction="up" />
				<ControlButton UID={this.props.player.UID} direction="left" />
				<ControlButton UID={this.props.player.UID} direction="right" />
				<ControlButton UID={this.props.player.UID} direction="down" />
				<BombButton UID={this.props.player.UID} />
			</div>
		);
	}
});


var AvatarOption = React.createClass({

	onClicked: function(){
		
		if( !this.props.available ){
			return;
		}

		//Make player, hide menu, and join game
	},

	render: function(){
		var classes = "avatar-option " + this.props.avatar;		

		return (
			<div className={classes} onClick={this.onClicked} >
				&nbsp;
			</div>
		);
	}
	
});


var AvatarSelect = React.createClass({

	render: function(){		

		return (
			<div className="avatar-select">
				{ 
					this.props.avatars.map( function( avatar, i ){
						return <AvatarOption avatar={avatar.id} available={avatar.available} />
					})
				}
			</div>
		);

	}

});

var MainMenu = React.createClass({

	getInitialState: function(){
		return {
			avatars: []
		}
	},

	componentDidMount: function(){
		//get available players
	},

	render: function(){
		
		return (
			<div className="main-menu">
				<div className="logo">&nbsp;</div>
				<AvatarSelect avatars={this.props.avatars} />
			</div>
		);

	}

});

/**
* The game
*/
var Game = React.createClass({

	getInitialState: function(){
		return {
			rows: [],
			timer: 0,
			players: []
		};
	},

	updateState: function( data ){
		this.setState( 
			{ 
				rows: data.tiles,
				timer: data.timer,
				players: data.players
			 } 
		);
	},

	componentDidMount: function(){
		var self = this;

		EventHandler.on( 'board-refresh', function( evt, response ){

			console.log( "UPDATED STATE" );
			if( response.status != "OK" ){
				console.log( "Error fetching board state" );
				return;
			}
			
			self.updateState( response.data );
		});

		setInterval( function(){ getGameState() }, 5000 );

		setInterval( function(){
			if( self.state.timer > 0 ){
				--self.state.timer;
			}
			console.log( self.state.timer );
		}, 1000 );
	},

	render: function(){

		var active_player = false;

		for( var i = 0; i < this.state.players.length; ++i ){
			if( this.state.players[i].is_human ){
				active_player = this.state.players[i];
				break;
			}
		}

		return (
			<div className="game">
				<Board rows={this.state.rows} />
				<Controls player={active_player} />
			</div>
		);
	}
});

ReactDOM.render(
	<Game />,
	document.getElementById('game')
);

ReactDOM.render(
	<MainMenu />,
	document.getElementById('menu')
);
