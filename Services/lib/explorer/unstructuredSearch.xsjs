//let oUnstructuredSearchLib = $.import("Services.lib.explorer", "unstructuredSearch");
try {
	//definition of all different variables. 
	let conn = $.db.getConnection();
	let sQueryString = $.request.parameters.get("sQuery");
	let sFuzzy = $.request.parameters.get("sFuzzy");
	let sSourceId = $.request.parameters.get("sSourceId");
	let sPostcode = $.request.parameters.get("sPostcode");
	let sCity = $.request.parameters.get("sCity");
	let sScvId = $.request.parameters.get("sScvId");
	let sSource = $.request.parameters.get("sSourceSystem");
	let sFinalSearchString = "";

	//do check for each variable being passed on. 
	if (typeof sFuzzy === "undefined" || sFuzzy === "") {
		sFuzzy = 0.8; // default to 0.8 if none set. 
	}
	
	//do check for each of the variable coming in as a failsafe. 
	// Will be appended to the search string for the query.
	// if there's nothing, then it will just be an empty string.
	if (typeof sPostcode === "undefined") {
		sPostcode = ""; // set to blank if there's none coming
	}

	if (typeof sCity === "undefined") {
		sCity = ""; // set to blank if there's none coming
	}
	
	if (typeof sScvId === "undefined") {
		sScvId = ""; // set to blank if there's none coming
	}
	
	if (typeof sSource === "undefined") {
		sSource = ""; // set to blank if there's none coming
	}
	
	if (typeof sSourceId === "undefined") {
		sSourceId = ""; // set to blank if there's none coming
	}

	//final search string to be part of the sql string for search with fuzzy. 
	sFinalSearchString = sQueryString + " " + sPostcode + " " + sCity;

	//need to take into account the different parameters that can be applied
	//depending on what is coming from the front end. 
	let sSqlQuery = "";
	let rs = "";
	let ptsmt = "";

	let sFinalResult = getFinalLoadForExecution(sScvId, sSource, sSourceId);
	ptsmt = conn.prepareStatement(sFinalResult);

	ptsmt.setString(1, "%" + sScvId + "%"); //set for like sql statement for wildcards
	ptsmt.setString(2, "%" + sSource + "%"); //set for like sql statement for wildcards
	ptsmt.setString(3, "%" + sSourceId + "%"); //set for like sql statement for wildcards
	ptsmt.setString(4, sFinalSearchString);
	ptsmt.setString(5, sFuzzy);

	//execute the query base on what is prepared on the statement. 

	rs = ptsmt.executeQuery();

	let finalResult = JSON.stringify(rs._rows);

	$.response.contentType = "application/json";
	$.response.setBody(finalResult);
	$.response.status = $.net.http.OK;

	ptsmt.close();

} catch (e) {
	$.response.setBody('Error in request!: ' + e.message);
	$.response.status = $.net.http.BAD_REQUEST;
} finally {
	if (typeof conn !== "undefined") {
		conn.close();
	}
}

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