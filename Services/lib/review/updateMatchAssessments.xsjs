/*
 * OSR SCV Match Results - Service to override system match recommendations
 * SAP Australia, September 2017
 */

// Request parameters
var entityId = $.request.parameters.get("ENTITY_ID");
var strategy = $.request.parameters.get("STRATEGY");
var action = $.request.parameters.get("ACTION");
var code = $.request.parameters.get("CODE");
var comment = $.request.parameters.get("COMMENT");
var matchrow = $.request.parameters.get("MATCH_ROW");

var conn = $.db.getConnection();
var pstmt = conn.prepareStatement(
	//"UPSERT \"osr.scv.foundation.db.data::MatchResultsReview.Assessments\" VALUES (?, ?, ?, ?, ?, ?) WHERE ENTITY_ID = ?"
	"INSERT INTO \"osr.scv.foundation.db.data::MatchResultsReview.Assessments\" (\"ENTITY_ID\", \"TIMESTAMP\", \"STRATEGY\", \"CODE\", \"COMMENT\", \"USER\", \"ACTION\", \"MATCH_ROW\") VALUES (?,?,?,?,?,?,?)"
);

function getTimestamp() {
	var d = new Date();
	var month = d.getUTCMonth().toString();
	var day = d.getUTCDate().toString();
	var year = d.getUTCFullYear();
	var hours = d.getUTCHours().toString();
	var minutes = d.getUTCMinutes().toString();
	var seconds = d.getUTCSeconds().toString();
	if (month.length < 2) {
		month = '0' + month;
	}
	if (day.length < 2) {
		day = '0' + day;
	}
	if (hours.length < 2) {
		hours = '0' + hours;
	}
	if (minutes.length < 2) {
		minutes = '0' + minutes;
	}
	if (seconds.length < 2) {
		seconds = '0' + seconds;
	}
	
	//var date_int = [year, month, day].join('-');
	//var time_int = [hours, minutes, seconds].join(':');

	//return date_int + ' ' + time_int;
	return new Date(year, month, day, hours, minutes, seconds);
}

try {

	/*
	console.log(entityId);
	console.log(strategy);
	console.log(code);
	console.log(comment);
	console.log($.session.getUsername());
	*/
	
	//console.log(getTimestamp());
	
	var response = {};

	if (!entityId || !strategy || !code || !comment) {

		// Create response    
		$.response.status = $.net.http.OK;
		$.response.contentType = "application/json";
		response = {"status": "success", "data": {}, "message": "Missing Parameters!" };
		$.response.setBody(response);

	} else {

		/* 
		key 1 TASK_NAME         : String(256);
        key 2 TASK_EXECUTION_ID : Integer64;
        key 3 ENTITY_ID         : String(10);
            4 STRATEGY          : String(10);
            5 CODE              : String(10);
            6 COMMENT           : String(512);
            7 USER              : String(10);
            8 TIMESTAMP         : UTCTimestamp;
		*/
		
		//pstmt.setString(1, taskName);
		//pstmt.setInteger(2, parseInt(taskId));
		pstmt.setString(1, entityId);
		pstmt.setTimestamp(2, getTimestamp());
		pstmt.setString(3, strategy);
		pstmt.setString(4, code);
		pstmt.setString(5, comment);
		pstmt.setString(6, $.session.getUsername());
		pstmt.setString(7, action);
		pstmt.setString(8, matchrow);
		
		//pstmt.setString(7, taskName);
		//pstmt.setInteger(8, parseInt(taskId));
		//pstmt.setString(7, entityId);

		// Execute upsert statement
		pstmt.execute();

		// Update match review table
		var strategyResolveStatus = strategy.indexOf('Promote') >= 0 ? 'Success' : 'Error';
		var actionResolveStatus = action.indexOf('Accept') >= 0 ? 'Success' : 'Error';
		pstmt = conn.prepareStatement(
			"UPDATE \"osr.scv.foundation.db.data::MatchResultsReview.Review\" SET \"STRATEGY\" = '" + strategy + "', \"STRATEGY_RESOLVED\" = '" + strategy + "', \"STRATEGY_RESOLVED_STATUS\" = '" + strategyResolveStatus + "', \"ACTION\" = '" + action + "', \"ACTION_RESOLVED\" = '" + action + "', \"ACTION_RESOLVED_STATUS\" = '" + actionResolveStatus +  "' WHERE ENTITY_ID = ?"
		);
		pstmt.setString(1, entityId);

		pstmt.execute();
		
		conn.commit();

		$.response.contentType = 'application/json';
		$.response.status = 200;
		$.response.status = $.net.http.OK;
		response = {"status": "success", "data": {}, "message": "Request successful!" };
		$.response.setBody(response);
	}
} catch (e) {
	$.response.setBody('Error in request!: ' + e.message);
	$.response.status = $.net.http.BAD_REQUEST;
} finally {
	pstmt.close();
	conn.close();
}