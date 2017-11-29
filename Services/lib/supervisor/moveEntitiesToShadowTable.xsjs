/*
 * OSR SCV Match Results - Service to move match entities to SCV master table (shadowed from match results)
 * SAP Australia, September 2017
 */

/**
 * Retrieves current timestamp
 */
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

/**
 * Moves entities to match results shadow table
 */
function moveEntitiesToShadowTable() {
	var conn = $.hdb.getConnection();
	//var output = JSON.stringify(entities);
	var fnMoveEntitiesToShadowTable = conn.loadProcedure("osr.scv.foundation.db.Procedures::SP_MoveEntityToShadowTable");
	var result = fnMoveEntitiesToShadowTable({
		//I_ENTITIES: entities,
		I_USER: $.session.getUsername(),
		I_TIMESTAMP: getTimestamp()
	});
	conn.commit();
	conn.close();

	if (result && result.o_return_code === "ERROR") {
		return {
			result: "ERROR"
		};
	} else {
		return {
			result: "SUCCESS"
		};
	}
}

// validate the inputs here!
var output = moveEntitiesToShadowTable();
var response = {};
if (output.result === "ERROR") {
		$.response.status = 500;
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		response = {"status": "error", "data": {}, "message": "Internal server error!" };
		$.response.setBody(response);			
} else {
		$.response.status = 201;
		$.response.status = $.net.http.CREATED;
		response = {"status": "success", "data": {}, "message": "Request successful!" };
		$.response.setBody(response);
}