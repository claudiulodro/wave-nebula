module.exports = {

	sendError: function( message ){
		return {
			status: "ERR",
			message: message,
			data: []
		};
	},

	sendSuccess: function( data ){
		return {
			status: "OK",
			message: "",
			data: data
		};
	}

};
