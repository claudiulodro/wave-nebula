var Tile = React.createClass({
	displayName: "Tile",

	render: function () {

		var classes = "tile " + this.props.data.type;
		var style = {};

		if (this.props.data.type == "player") {
			style = { backgroundColor: this.props.data.race }; //Todo make this right
		}

		return React.createElement(
			"div",
			{ className: classes, style: style },
			this.props.data.type
		);
	}

});

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
			{ className: classes, onClick: this.onClicked },
			this.props.direction
		);
	}

});

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
			{ className: classes, onClick: this.onClicked },
			"Bomb"
		);
	}

});

var Controls = React.createClass({
	displayName: "Controls",

	render: function () {

		return React.createElement(
			"div",
			{ className: "controls" },
			React.createElement(ControlButton, { UID: this.props.player.UID, direction: "up" }),
			React.createElement(ControlButton, { UID: this.props.player.UID, direction: "left" }),
			React.createElement(ControlButton, { UID: this.props.player.UID, direction: "right" }),
			React.createElement(ControlButton, { UID: this.props.player.UID, direction: "down" }),
			React.createElement(BombButton, { UID: this.props.player.UID })
		);
	}
});

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
				--self.state.timer;
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
			React.createElement(Board, { rows: this.state.rows }),
			React.createElement(Controls, { player: active_player })
		);
	}
});

ReactDOM.render(React.createElement(Game, null), document.getElementById('game'));