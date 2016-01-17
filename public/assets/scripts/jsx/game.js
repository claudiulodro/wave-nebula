/**
* One tile on the field
*/
var Tile = React.createClass({

	render: function(){

		var classes = "tile " + this.props.data.type;
		var style = {};
		var text = "";

		if( this.props.data.type == "player" ){
			 classes += " avatar-" + this.props.data.avatar;
			text = this.props.data.score;
		}

		if( this.props.data.type == "bomb" ){
			classes += " remaining-"+this.props.data.turns_remaining;
		}

		return (
			<div className={classes} style={style}>
				<div className="score">{text}</div>
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
* Moves screen up or down
*/
var ScrollButton = React.createClass({

	getInitialState: function(){
		return {
			scrolling: false,
			scrollTimer: null
		}
	},

	startScrolling: function(){

		var self = this;
		var interval = 50;
		var increment = 50;

		if( this.state.scrollTimer != null ){
			clearInterval( this.state.scrollTimer );
		}

		var scroll_timer = setInterval( function(){

			var window_position = $( window ).scrollTop();

			if( self.props.direction == "down" ){
				window_position = window_position + increment;
			}
			else {
				window_position = window_position - increment;
			}

    			$('html, body').animate({
        			scrollTop: window_position
    			}, interval );

		}, interval );

		this.setState(
			{
				scrolling: true,
				scrollTimer: scroll_timer
			}
		);

	},

	stopScrolling: function(){

		if( this.state.scrollTimer != null ){
			clearInterval( this.state.scrollTimer );
		}

		this.setState( 
			{ 
				scrolling: false,
				scrollTimer: null
			 } 
		);
	},

	render: function(){
		var classes = "scroll-button " + this.props.direction;

		return (
			<div className={classes} onMouseDown={this.startScrolling} onMouseUp={this.stopScrolling} onTouchStart={this.startScrolling} onTouchEnd={this.stopScrolling}>&nbsp;</div>
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
			<div className="control-button-container">
				<div className={classes} onClick={this.onClicked} >
					&nbsp;
				</div>
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
			<div className="control-button-container">
				<div className={classes} onClick={this.onClicked} >
					&nbsp;
				</div>
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
			<div className="controls-container">
				<div className="controls">
					<ControlButton UID={this.props.player.UID} direction="up" />
					<ControlButton UID={this.props.player.UID} direction="left" />
					<ControlButton UID={this.props.player.UID} direction="right" />
					<ControlButton UID={this.props.player.UID} direction="down" />
					<BombButton UID={this.props.player.UID} />
				</div>
			</div>
		);
	}
});

/**
* UI for timer and move limit
*/
var Nav = React.createClass({

	getInitialState: function(){
		return {
			timer: 0
		}
	},

	render: function(){
		
		var moves_remaining_string = "";
		for( var i = 0; i < this.props.player.moves_remaining; ++i ){
			moves_remaining_string += "*";
		}

		return (
			<div className="nav-bar-container">
				<div className="nav-bar">
					<div className="timer">{this.props.timer}</div>
					<div className="remaining-moves">{moves_remaining_string}</div>
				</div>
			</div>
		);

	}

});

/**
* One avatar possibility
*/
var AvatarOption = React.createClass({

	onClicked: function(){
		
		if( !this.props.available ){
			return;
		}

		addPlayer( this.props.avatar );
		var self = this;

		EventHandler.on( 'player-added', function( evt, response ){

			if( response.status != "OK" ){
				console.log( "Error making player" );
				return;
			}
			
			self.props.onSelected();

			ReactDOM.render(
				<Game UID={response.data} />,
				document.getElementById('game')
			);
		});

	},

	render: function(){
		var classes = "avatar-option avatar-" + this.props.avatar;	
		if( this.props.available ){
			classes += " available";
		}	

		return (
			<div className={classes} onClick={this.onClicked} >
				&nbsp;
			</div>
		);
	}
	
});

/**
* The avatar select menu
*/
var AvatarSelect = React.createClass({

	render: function(){	
		var self = this;

		return (


			<div className="avatar-select">
				{ 
					this.props.avatars.map( function( avatar, i ){
						return <AvatarOption avatar={avatar.id} available={avatar.available} onSelected={self.props.onSelected} />
					})
				}
			</div>
		);

	}

});

/**
* The main menu
*/
var MainMenu = React.createClass({

	getInitialState: function(){
		return {
			avatars: [],
			visible: true
		}
	},

	updateState: function( data ){
		this.setState( 
			{ 
				avatars: data
			 } 
		);
	},

	componentDidMount: function(){
		var self = this;
		getAvatars();

		EventHandler.on( 'avatars-fetched', function( evt, response ){

			if( response.status != "OK" ){
				console.log( "Error fetching avatars" );
				return;
			}
			
			self.updateState( response.data );
		});
	},

	onSelected: function(){
		this.setState( { visible: false } );
	},

	render: function(){

		if( typeof this.state === 'undefined' || typeof this.state.avatars === 'undefined' ){
			return (
			<div className="main-menu">
				<div className="logo">Wave Nebula</div>
				<div className="loading">Loading . . .</div>
			</div>
			);
		}

		var classes = "main-menu";
		if( !this.state.visible ){
			classes += " is-hidden";
		}

		return (
			<div className={classes}>
				<div className="logo">Wave Nebula</div>
				<AvatarSelect avatars={this.state.avatars} onSelected={this.onSelected}/>
				<div className="instruction">Turn phone sideways</div>
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

			if( response.status != "OK" ){
				console.log( "Error fetching board state" );
				return;
			}
			
			self.updateState( response.data );
		});

		setInterval( function(){ getGameState() }, 1000 );

		setInterval( function(){
			if( self.state.timer > 0 ){
				self.setState({
					timer: self.state.timer - 1
				});				
			}

		}, 1000 );
	},

	render: function(){

		var active_player = false;

		for( var i = 0; i < this.state.players.length; ++i ){
			if( this.state.players[i].UID == this.props.UID ){
				active_player = this.state.players[i];
				break;
			}
		}

		if( !active_player && this.state.players.length ){
			location.reload();
		}

		if( active_player.status == 'dead' ){
			return (
				<div className="game-over">

					<div className="message">
						You have died. 
					</div>

					<div className="link">
						<a href="/">Play Again</a>
					</div>

				</div>
			);
		}

		return (
			<div className="game">
				<Nav timer={this.state.timer} player={active_player} />
				<Board rows={this.state.rows} />
				<Controls player={active_player} />
				<div className="scroll-button-container">
					<ScrollButton direction="up" />
					<ScrollButton direction="down" />
				</div>
			</div>
		);
	}
});

ReactDOM.render(
	<MainMenu />,
	document.getElementById('menu')
);
