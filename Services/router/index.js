"use strict";

module.exports = function(app) {
	
	// Set routes
	app.use("/webapp/rest", require("./routes/routes")());
};