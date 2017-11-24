"use strict";

module.exports = function(app) {
	
	// Set routes
	app.use("/scv/match/srv/rest", require("./routes/routes")());
};