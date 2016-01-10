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
	displayName: "Tile",

	render: function () {

		var classes = "tile " + this.props.data.type;
		var style = {};

		if (this.props.data.type == "player") {
			classes += " avatar-" + this.props.data.avatar;
		}

		return React.createElement(
			"div",
			{ className: classes, style: style },
			" "
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

var Nav = React.createClass({
	displayName: "Nav",

	getInitialState: function () {
		return {
			timer: 0
		};
	},

	render: function () {

		return React.createElement(
			"div",
			{ className: "nav-bar" },
			React.createElement(
				"div",
				{ className: "timer" },
				this.props.timer
			)
		);
	}

});

var AvatarOption = React.createClass({
	displayName: "AvatarOption",

	onClicked: function () {

		if (!this.props.available) {
			return;
		}

		//Make player, hide menu, and join game
	},

	render: function () {
		var classes = "avatar-option " + this.props.avatar;

		return React.createElement(
			"div",
			{ className: classes, onClick: this.onClicked },
			" "
		);
	}

});

var AvatarSelect = React.createClass({
	displayName: "AvatarSelect",

	render: function () {

		return React.createElement(
			"div",
			{ className: "avatar-select" },
			this.props.avatars.map(function (avatar, i) {
				return React.createElement(AvatarOption, { avatar: avatar.id, available: avatar.available });
			})
		);
	}

});

var MainMenu = React.createClass({
	displayName: "MainMenu",

	getInitialState: function () {
		return {
			avatars: []
		};
	},

	componentDidMount: function () {
		//get available players
	},

	render: function () {

		return React.createElement(
			"div",
			{ className: "main-menu" },
			React.createElement(
				"div",
				{ className: "logo" },
				" "
			),
			React.createElement(AvatarSelect, { avatars: this.props.avatars })
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

			console.log("UPDATED STATE");
			if (response.status != "OK") {
				console.log("Error fetching board state");
				return;
			}

			self.updateState(response.data);
		});

		setInterval(function () {
			getGameState();
		}, 5000);

		setInterval(function () {
			if (self.state.timer > 0) {
				self.setState({
					timer: self.state.timer - 1
				});
			}
			console.log(self.state.timer);
		}, 1000);
	},

	render: function () {

		var active_player = false;

		for (var i = 0; i < this.state.players.length; ++i) {
			if (this.state.players[i].is_human) {
				active_player = this.state.players[i];
				break;
			}
		}

		return React.createElement(
			"div",
			{ className: "game" },
			React.createElement(Nav, { timer: this.state.timer }),
			React.createElement(Board, { rows: this.state.rows }),
			React.createElement(Controls, { player: active_player })
		);
	}
});

ReactDOM.render(React.createElement(Game, null), document.getElementById('game'));

ReactDOM.render(React.createElement(MainMenu, null), document.getElementById('menu'));