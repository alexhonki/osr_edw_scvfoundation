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

	let sFrontQuery =
		"SELECT DISTINCT \"SCV_ID\",TO_DOUBLE(ROUND(TO_DECIMAL(SCORE()),2)) as SCORE, \"SEARCH_STRING_CLEANSED\" " +
		"FROM \"osr.scv.foundation.db.data::SCVFoundation.Search\" WHERE ";

	let sEndingQuery = "CONTAINS (SEARCH_STRING, ?, FUZZY (?)) ORDER BY SCORE DESC, \"SCV_ID\" ASC";

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