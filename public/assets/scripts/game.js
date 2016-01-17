/**
* One tile on the field
*/
var Tile = React.createClass({
	displayName: "Tile",

	render: function () {

		var classes = "tile " + this.props.data.type;
		var style = {};
		var text = "";

		if (this.props.data.type == "player") {
			classes += " avatar-" + this.props.data.avatar;
			text = this.props.data.score;
		}

		if (this.props.data.type == "bomb") {
			classes += " remaining-" + this.props.data.turns_remaining;
		}

		return React.createElement(
			"div",
			{ className: classes, style: style },
			React.createElement(
				"div",
				{ className: "score" },
				text
			)
		);
	}

});

/**
* One row of Tiles
*/
var Row = React.createClass({
	displayName: "Row",

	render: function () {

		return React.createElement(
			"div",
			{ className: "row" },
			this.props.tiles.map(function (tile, i) {
				return React.createElement(Tile, { data: tile });
			})
		);
	}

});

/**
* Moves screen up or down
*/
var ScrollButton = React.createClass({
	displayName: "ScrollButton",

	getInitialState: function () {
		return {
			scrolling: false,
			scrollTimer: null
		};
	},

	startScrolling: function () {

		var self = this;
		var interval = 50;
		var increment = 50;

		if (this.state.scrollTimer != null) {
			clearInterval(this.state.scrollTimer);
		}

		var scroll_timer = setInterval(function () {

			var window_position = $(window).scrollTop();

			if (self.props.direction == "down") {
				window_position = window_position + increment;
			} else {
				window_position = window_position - increment;
			}

			$('html, body').animate({
				scrollTop: window_position
			}, interval);
		}, interval);

		this.setState({
			scrolling: true,
			scrollTimer: scroll_timer
		});
	},

	stopScrolling: function () {

		if (this.state.scrollTimer != null) {
			clearInterval(this.state.scrollTimer);
		}

		this.setState({
			scrolling: false,
			scrollTimer: null
		});
	},

	render: function () {
		var classes = "scroll-button " + this.props.direction;

		return React.createElement(
			"div",
			{ className: classes, onMouseDown: this.startScrolling, onMouseUp: this.stopScrolling, onTouchStart: this.startScrolling, onTouchEnd: this.stopScrolling },
			" "
		);
	}

});

/**
* The game board
*/
var Board = React.createClass({
	displayName: "Board",

	render: function () {

		if (typeof this.props === 'undefined' || typeof this.props.rows === 'undefined') {
			return React.createElement("div", { className: "board" });
		}

		return React.createElement(
			"div",
			{ className: "board" },
			this.props.rows.map(function (row, i) {
				return React.createElement(Row, { tiles: row });
			})
		);
	}

});

/**
* A button for making directional moves
*/
var ControlButton = React.createClass({
	displayName: "ControlButton",

	onClicked: function () {

		if (this.props.UID == null) {
			return;
		}

		sendMove(this.props.UID, this.props.direction);
	},

	render: function () {
		var classes = "control-button " + this.props.direction;

		return React.createElement(
			"div",
			{ className: "control-button-container" },
			React.createElement(
				"div",
				{ className: classes, onClick: this.onClicked },
				" "
			)
		);
	}

});

/**
* A button for dropping bombs
*/
var BombButton = React.createClass({
	displayName: "BombButton",

	onClicked: function () {

		if (this.props.UID == null) {
			return;
		}

		sendBomb(this.props.UID);
	},

	render: function () {
		var classes = "control-button bomb";

		return React.createElement(
			"div",
			{ className: "control-button-container" },
			React.createElement(
				"div",
				{ className: classes, onClick: this.onClicked },
				" "
			)
		);
	}

});

/**
* The player controls
*/
var Controls = React.createClass({
	displayName: "Controls",

	render: function () {

		return React.createElement(
			"div",
			{ className: "controls-container" },
			React.createElement(
				"div",
				{ className: "controls" },
				React.createElement(ControlButton, { UID: this.props.player.UID, direction: "up" }),
				React.createElement(ControlButton, { UID: this.props.player.UID, direction: "left" }),
				React.createElement(ControlButton, { UID: this.props.player.UID, direction: "right" }),
				React.createElement(ControlButton, { UID: this.props.player.UID, direction: "down" }),
				React.createElement(BombButton, { UID: this.props.player.UID })
			)
		);
	}
});

/**
* UI for timer and move limit
*/
var Nav = React.createClass({
	displayName: "Nav",

	getInitialState: function () {
		return {
			timer: 0
		};
	},

	render: function () {

		var moves_remaining_string = "";
		for (var i = 0; i < this.props.player.moves_remaining; ++i) {
			moves_remaining_string += "*";
		}

		return React.createElement(
			"div",
			{ className: "nav-bar-container" },
			React.createElement(
				"div",
				{ className: "nav-bar" },
				React.createElement(
					"div",
					{ className: "timer" },
					this.props.timer
				),
				React.createElement(
					"div",
					{ className: "remaining-moves" },
					moves_remaining_string
				)
			)
		);
	}

});

/**
* One avatar possibility
*/
var AvatarOption = React.createClass({
	displayName: "AvatarOption",

	onClicked: function () {

		if (!this.props.available) {
			return;
		}

		addPlayer(this.props.avatar);
		var self = this;

		EventHandler.on('player-added', function (evt, response) {

			if (response.status != "OK") {
				console.log("Error making player");
				return;
			}

			self.props.onSelected();

			ReactDOM.render(React.createElement(Game, { UID: response.data }), document.getElementById('game'));
		});
	},

	render: function () {
		var classes = "avatar-option avatar-" + this.props.avatar;
		if (this.props.available) {
			classes += " available";
		}

		return React.createElement(
			"div",
			{ className: classes, onClick: this.onClicked },
			" "
		);
	}

});

/**
* The avatar select menu
*/
var AvatarSelect = React.createClass({
	displayName: "AvatarSelect",

	render: function () {
		var self = this;

		return React.createElement(
			"div",
			{ className: "avatar-select" },
			this.props.avatars.map(function (avatar, i) {
				return React.createElement(AvatarOption, { avatar: avatar.id, available: avatar.available, onSelected: self.props.onSelected });
			})
		);
	}

});

/**
* The main menu
*/
var MainMenu = React.createClass({
	displayName: "MainMenu",

	getInitialState: function () {
		return {
			avatars: [],
			visible: true
		};
	},

	updateState: function (data) {
		this.setState({
			avatars: data
		});
	},

	componentDidMount: function () {
		var self = this;
		getAvatars();

		EventHandler.on('avatars-fetched', function (evt, response) {

			if (response.status != "OK") {
				console.log("Error fetching avatars");
				return;
			}

			self.updateState(response.data);
		});
	},

	onSelected: function () {
		this.setState({ visible: false });
	},

	render: function () {

		if (typeof this.state === 'undefined' || typeof this.state.avatars === 'undefined') {
			return React.createElement(
				"div",
				{ className: "main-menu" },
				React.createElement(
					"div",
					{ className: "logo" },
					"Wave Nebula"
				),
				React.createElement(
					"div",
					{ className: "loading" },
					"Loading . . ."
				)
			);
		}

		var classes = "main-menu";
		if (!this.state.visible) {
			classes += " is-hidden";
		}

		return React.createElement(
			"div",
			{ className: classes },
			React.createElement(
				"div",
				{ className: "logo" },
				"Wave Nebula"
			),
			React.createElement(AvatarSelect, { avatars: this.state.avatars, onSelected: this.onSelected }),
			React.createElement(
				"div",
				{ className: "instruction" },
				"Turn phone sideways"
			)
		);
	}

});

/**
* The game
*/
var Game = React.createClass({
	displayName: "Game",

	getInitialState: function () {
		return {
			rows: [],
			timer: 0,
			players: []
		};
	},

	updateState: function (data) {
		this.setState({
			rows: data.tiles,
			timer: data.timer,
			players: data.players
		});
	},

	componentDidMount: function () {
		var self = this;

		EventHandler.on('board-refresh', function (evt, response) {

			if (response.status != "OK") {
				console.log("Error fetching board state");
				return;
			}

			self.updateState(response.data);
		});

		setInterval(function () {
			getGameState();
		}, 1000);

		setInterval(function () {
			if (self.state.timer > 0) {
				self.setState({
					timer: self.state.timer - 1
				});
			}
		}, 1000);
	},

	render: function () {

		var active_player = false;

		for (var i = 0; i < this.state.players.length; ++i) {
			if (this.state.players[i].UID == this.props.UID) {
				active_player = this.state.players[i];
				break;
			}
		}

		if (!active_player && this.state.players.length) {
			location.reload();
		}

		if (active_player.status == 'dead') {
			return React.createElement(
				"div",
				{ className: "game-over" },
				React.createElement(
					"div",
					{ className: "message" },
					"You have died."
				),
				React.createElement(
					"div",
					{ className: "link" },
					React.createElement(
						"a",
						{ href: "/" },
						"Play Again"
					)
				)
			);
		}

		return React.createElement(
			"div",
			{ className: "game" },
			React.createElement(Nav, { timer: this.state.timer, player: active_player }),
			React.createElement(Board, { rows: this.state.rows }),
			React.createElement(Controls, { player: active_player }),
			React.createElement(
				"div",
				{ className: "scroll-button-container" },
				React.createElement(ScrollButton, { direction: "up" }),
				React.createElement(ScrollButton, { direction: "down" })
			)
		);
	}
});

ReactDOM.render(React.createElement(MainMenu, null), document.getElementById('menu'));