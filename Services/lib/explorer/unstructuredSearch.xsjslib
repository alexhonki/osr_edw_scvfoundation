/*
 * Created by Stefanus
 * A library to handle scvExplorer xsjs 
 * Logic function doing
 * 07.06.2018 
 */

"use strict";

//build the sql query base on like, that way we don't get smashed doing
//the logic and everything can go through
function getFinalLoadForExecution(sScvId, sSource, sSourceId) {
	//3 criterias for the WHERE clause 
	//sourceid e.g 0001350449
	//scvid e.g 2005337 - unique entry to the table
	//source e.g RMS , TMR

	// REMOVE SELECTING THE SCORE, can be re-enable if needed.
	// seems the distinct on SCORE, even though the score is the same is considered 2 
	// different records.
	// let sFrontQuery =
	// 	"SELECT DISTINCT \"SCV_ID\",TO_DOUBLE(ROUND(TO_DECIMAL(SCORE()),2)) as SCORE, \"SEARCH_STRING_CLEANSED\" " +
	// 	"FROM \"osr.scv.foundation.db.data::SCVFoundation.Search\" WHERE ";

	// let sEndingQuery = "CONTAINS (SEARCH_STRING, ?, FUZZY (?)) ORDER BY SCORE DESC, \"SCV_ID\" ASC";

	//NOT NULL is used for fail safe in case there's NULL happening in the table itself.
	let sFrontQuery =
		"SELECT DISTINCT \"SCV_ID\", \"SEARCH_STRING_CLEANSED\", SCORE() as \"SCORE\" " +
		"FROM \"osr.scv.foundation.db.data::SCVFoundation.Search\" WHERE \"SEARCH_STRING_CLEANSED\" IS NOT NULL AND ";

	let sEndingQuery = "CONTAINS (SEARCH_STRING, ?, FUZZY (?)) ORDER BY \"SCORE\" DESC";

	if (typeof sScvId !== "undefined") {
		sFrontQuery += " \"SCV_ID\" LIKE ? AND ";
	}

	if (typeof sSource !== "undefined") {
		sFrontQuery += " \"SOURCE\" LIKE ? AND ";
	}

	if (typeof sSourceId !== "undefined") {
		sFrontQuery += " \"SOURCE_ID\" LIKE ? AND ";
	}

	//build the back part of the query. 
	sFrontQuery += sEndingQuery;

	//return the built sql search string.
	return sFrontQuery;
}

/**
 * get chosen if we are only searching the source id. 
 * NOT NULL is used for fail safe in case there's NULL happening
 * on the Search table. 
 */
function getSourceIdSearchOnly() {
	let sFrontQuery =
		"SELECT DISTINCT \"SCV_ID\", \"SEARCH_STRING_CLEANSED\" " +
		"FROM \"osr.scv.foundation.db.data::SCVFoundation.Search\" WHERE \"SEARCH_STRING_CLEANSED\" IS NOT NULL AND \"SOURCE_ID\" = ? ";

	return sFrontQuery;
}

/**
 * get chosen when we are searching the source id and this because the length
 * of SCV ID could be in the same region as driver and RMS BP number or TMR number. 
 * NOT NULL is used for fail safe in case there's NULL happening
 * on the Search table. 
 */
function getScvIdSearchOnly() {
	let sFrontQuery =
		"SELECT DISTINCT \"SCV_ID\", \"SEARCH_STRING_CLEANSED\" " +
		"FROM \"osr.scv.foundation.db.data::SCVFoundation.Search\" WHERE \"SEARCH_STRING_CLEANSED\" IS NOT NULL AND \"SCV_ID\" = ? ";
	return sFrontQuery;
}

/**
 * Transform result before spitting out the data, so that no pre-processing 
 * happen in the front-end to reduce load for the browsers.
 * @return  {[Array]} oFinalData [contain all pre-processed result and distinct]
 */
function transformResults(oResultRows) {

	let oFinalData = [];
	let aIdChecker = []; //use to check whether an id exist or not
	let aIndexToRemove = [];

	//transform the data according to the results. 
	for (let i = 0; i < oResultRows.length; i++) {

		//pre-process the result and split base on "|"
		let aSplitResult = oResultRows[i].SEARCH_STRING_CLEANSED.split("|");

		//if it does not exist add it into the result.
		if (aIdChecker.indexOf(oResultRows[i].SCV_ID) === -1) {

			//push this SCV ID into the array for checking next.
			aIdChecker.push(oResultRows[i].SCV_ID);

			//determine to check whether it is 3 names or not.
			//the entity contain a middle name or not. 
			if (aSplitResult.length === 10) {
				oResultRows[i].FIRST_NAME = aSplitResult[0];
				oResultRows[i].LAST_NAME = aSplitResult[1];
				oResultRows[i].CITY = aSplitResult[3];
				oResultRows[i].DOB = this._reverseStringDOB(aSplitResult[2]);
				oResultRows[i].POSTAL_CODE = aSplitResult[4];
			} else if (aSplitResult.length === 11) {
				oResultRows[i].FIRST_NAME = aSplitResult[0] + " " + aSplitResult[1];
				oResultRows[i].LAST_NAME = aSplitResult[2];
				oResultRows[i].CITY = aSplitResult[4];
				oResultRows[i].DOB = this._reverseStringDOB(aSplitResult[3]);
				oResultRows[i].POSTAL_CODE = aSplitResult[5];
			}

			oFinalData.push(oResultRows[i]);

			//if this is done and its empty, remove the last inserted
			// if (oResultRows[i].CITY === "" || oResultRows[i].POSTAL_CODE === "") {
			// 	oFinalData.pop();
			// 	aIdChecker.pop();
			// } else {
			// 	oFinalData.push(oResultRows[i]);
			// }

		} else if (aIdChecker.indexOf(oResultRows[i].SCV_ID) !== -1) { //an entity id already exist
			//check that the entity id address oFinalData is not empty

			if (aSplitResult.length === 10) {

				this._checkAddressIsNotEmpty(oFinalData, aSplitResult.length, aSplitResult[3], aSplitResult[4], oResultRows[i].SCV_ID);
				// oResultRows[i].CITY = aSplitResult[3];
				// oResultRows[i].POSTAL_CODE = aSplitResult[4];

			} else if (aSplitResult.length === 11) {

				this._checkAddressIsNotEmpty(oFinalData, aSplitResult.length, aSplitResult[4], aSplitResult[5], oResultRows[i].SCV_ID);
				// oResultRows[i].CITY = aSplitResult[4];
				// oResultRows[i].POSTAL_CODE = aSplitResult[5];

			}

		}

	}

	return oFinalData;
}

//check the particular scv id contains an address 
//or empty string.
function _checkAddressIsNotEmpty(oFinalData, iResultLength, sCity, sPostalCode, sCurrentScvId) {
	for (let i = 0; i < oFinalData.length; i++) {
		if (oFinalData[i].SCV_ID === sCurrentScvId) {
			if (oFinalData[i].CITY === "" || oFinalData[i].POSTAL_CODE === "") {
				oFinalData[i].CITY = sCity;
				oFinalData[i].POSTAL_CODE = sPostalCode;
				break;
			}
		}
	}
}

/**
 * Reverse the string of DOB for the SCV.
 * Split base on the '-'
 * reverse the array with reverse
 * join it back with seperator of '/'
 */
function _reverseStringDOB(str) {
	return str.split("-").reverse().join("/");
}