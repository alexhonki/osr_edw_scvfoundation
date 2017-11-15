/*
 * OSR SCV Match Results - Service to override system match recommendations
 * SAP Australia, September 2017
 */

// Request parameters
var entityId = $.request.parameters.get("ENTITY_ID");

var conn = $.db.getConnection();
var pstmt = conn.prepareStatement("SELECT * FROM \"osr.scv.foundation.db.data::MatchResultsReview.Assessments\" WHERE ENTITY_ID = ?");

try {

	// Variables
	var output = {};
	output.data = [];
	var response = {};

	if (!entityId) {

		// Create response    
		$.response.status = $.net.http.OK;
		$.response.contentType = "application/json";
		response = {
			"status": "success",
			"data": {},
			"message": "Missing Parameters!"
		};
		$.response.setBody(response);

	} else {

		pstmt.setString(1, entityId);
		
		// Execute upsert statement
		var rs = pstmt.executeQuery();
		var rsmd = rs.getMetaData();

		// Create JSON response object
		var numColumns = rsmd.getColumnCount();
		var tag;
		var str;
		var jsonObj = {};
		var i = 1;
		while (rs.next()) {
			jsonObj = {};
			i = 1;
			for (i; i < numColumns + 1; i++) {
				tag = rsmd.getColumnLabel(i); //.toLowerCase();
				jsonObj[tag] = rs.getString(i);
			}
			output.data.push(jsonObj);
		}

		// Create response
		$.response.setBody(JSON.stringify(output));
		$.response.contentType = "text/json";
		$.response.status = $.net.http.OK;
		$.response.status = 200;

	}
} catch (e) {
	$.response.setBody('Error in request!: ' + e.message);
	$.response.status = $.net.http.BAD_REQUEST;
} finally {
	pstmt.close();
	conn.close();
}