try {
	let conn = $.db.getConnection();
	let sQueryString = $.request.parameters.get("sQuery");
	let sFuzzy = $.request.parameters.get("sFuzzy");
	let sSourceId = $.request.parameters.get("sSourceId");
	let sPostcode = $.request.parameters.get("sPostcode");
	let sCity = $.request.parameters.get("sCity");
	let sScvId = $.request.parameters.get("sScvId");
	let sSource = $.request.parameters.get("sSource");

	$.response.contentType = "application/json";
	
	//need to take into account the different parameters that can be applied
	//depending on what is coming from the front end. 
	
	let sQuery =
		"SELECT DISTINCT \"SCV_ID\",TO_DOUBLE(ROUND(TO_DECIMAL(SCORE()),2)) as SCORE, \"SEARCH_STRING_CLEANSED\" " +
		"FROM \"osr.scv.foundation.db.data::SCVFoundation.Search\" " +
		"WHERE CONTAINS (SEARCH_STRING, ?, FUZZY (?)) ORDER BY SCORE DESC, \"SCV_ID\" DESC";

	let rs;
	let ptsmt = conn.prepareStatement(sQuery);
	ptsmt.setString(1, sQueryString);
	ptsmt.setString(2, sFuzzy);
	rs = ptsmt.executeQuery();
	
	let finalResult = JSON.stringify(rs._rows);

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