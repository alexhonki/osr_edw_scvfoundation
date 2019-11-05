/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0 */
"use strict";
var express = require("express");
var routeHelper = require("./routesHelper");
module.exports = function () {

	var appRouter = express.Router();
	var async = require("async");

	/**
	 * Search (GET)
	 * 
	 * The search request returns the customer references found in the matching table. A fuzzy search parameter can be specified for last bane abd furst nam.
	 * @param {string} req - Request
	 * @param {string} res - Response
	 */
	appRouter.get("/stats", function (req, res) {
		var client = req.db;

		var stmt =
			"SELECT 'KPI_001' as KPI, 'Total number of groups' as KPI_INFO, MAX(GROUP_ID) as VALUE from (SELECT * FROM \"osr.scv.foundation.db.data::MatchResultsBase.MatchResults\" ORDER BY GROUP_ID ASC) " +
			"UNION ALL " +
			"SELECT 'KPI_002' as KPI, 'Number of groups with different IDs within each group' as KPI_INFO, count(*) as VALUE FROM ( " +
			"SELECT GROUP_ID, SOURCE_SYSTEM FROM (SELECT * FROM \"osr.scv.foundation.db.data::MatchResultsBase.MatchResults\" ORDER BY GROUP_ID ASC) " +
			"GROUP BY GROUP_ID, SOURCE_SYSTEM " +
			"HAVING COUNT(DISTINCT SYSTEM_ID) > 1 AND GROUP_ID IS NOT NULL)" +
			"UNION ALL " +
			"SELECT 'KPI_003' as KPI, 'Number of groups with different IDs within each group for system RMS only' as KPI_INFO, count(*) as VALUE FROM ( " +
			"SELECT GROUP_ID, SOURCE_SYSTEM FROM (SELECT * FROM \"osr.scv.foundation.db.data::MatchResultsBase.MatchResults\" ORDER BY GROUP_ID ASC) " +
			"GROUP BY GROUP_ID, SOURCE_SYSTEM " +
			"HAVING COUNT(DISTINCT SYSTEM_ID) > 1 AND GROUP_ID IS NOT NULL AND SOURCE_SYSTEM = 'RMS')";

		// Prepare SQL statement
		console.log(stmt);

		async.waterfall([

			function prepare(callback) {
				client.prepare(stmt,
					function (err, statement) {
						callback(null, err, statement);
					});
			},

			function execute(err, statement, callback) {
				statement.exec([], function (execErr, results) {
					callback(null, execErr, results);
				});
			},
			function response(err, results, callback) {
				if (err) {
					res.type("text/plain").status(500).send("ERROR: " + err.toString());
					return;
				} else {

					// Check result set size

					var result = JSON.stringify({
						Objects: results
					});
					res.type("application/json").status(200).send(result);
				}
				callback();
			}
		]);
	});

	// Get the count of RMS Relationship for a particular group id
	appRouter.get("/getPersonBdm", function (req, res) {

		routeHelper.getPersonBdm(req, res);

	});

	/**
	 * Helper function to check for empty objects
	 * @param {object} obj - Object to check
	 */
	function isEmptyObject(obj) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				return false;
			}
		}
		return true;
	}

	return appRouter;
};