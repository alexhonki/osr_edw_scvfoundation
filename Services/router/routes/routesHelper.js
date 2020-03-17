/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
"use strict";
const express = require("express");
const async = require("async");

module.exports = {

	/**
	 * Get Group Alerts using an Alert ID
	 * If the Alert Id is associated with a group, this will return all the Alert IDs for that group
	 * We can get specific to alert data by passing the URL parameter - specific=true
	 * */
	getPersonBdm: function (oRequest, oResponse) {
		try {
			
			const sScvId = oRequest.query.scvId;
			if (!sScvId || sScvId === "") {
				throw Error("Please enter a valid SCV ID");
			}
			
			let oQuery = oRequest.query;
			let sFinalSearchString =
				`SELECT
				SCV_ID,
				SOURCE,
				SOURCE_ID,
				VALID_FROM,
				VALID_TO,
				TO_VARCHAR(PERSON_BDM_ID) AS PERSON_BDM_ID,
				LAST_NAME,
				FIRST_NAME,
				ALSO_KNOWN_AS,
				BIRTH_DATE,
				DEATH_DATE,
				AGE_AT_DEATH,
				STD_PERSON_GN,
				STD_PERSON_GN2,
				STD_PERSON_FN,
				SCV_LOAD_ID 
				FROM "osr.scv.foundation.db.data::SCVFoundation.PersonBdm" WHERE SCV_ID = '${sScvId}'`;

			let client = oRequest.db;
			let oController = this;
			async.waterfall([

				function prepare(callback) {
					client.prepare(
						sFinalSearchString,
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
						oResponse.type("text/plain").status(500).send("ERROR: " + err.toString());
						return;
					} else {
						
						let result = JSON.stringify({
							Total: results.length,
							Results: results
						});
						oResponse.type("application/json").status(200).send(result);
					}
					callback(null, results);
				}
			], function (err, result) {
				
			});

		} catch (e) {
			oResponse.status(500).json({
				message: e.message
			});
		}
	}

};