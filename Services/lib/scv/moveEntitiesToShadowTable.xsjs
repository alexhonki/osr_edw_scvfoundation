/*
 * OSR SCV Match Results - Service to move match entities to SCV master table (shadowed from match results)
 * SAP Australia, September 2017
 */

/**
 * Retrieves current timestamp
 */
function getTimestamp() {
	var d = new Date();
	var month = d.getMonth().toString();
	var day = d.getDate().toString();
	var year = d.getFullYear();
	var hours = d.getHours().toString();
	var minutes = d.getMinutes().toString();
	var seconds = d.getSeconds().toString();
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
function moveEntitiesToShadowTable(entities) {
	var conn = $.hdb.getConnection();
	var output = JSON.stringify(entities);
	var fnMoveEntitiesToShadowTable = conn.loadProcedure("osr.scv.foundation.db.Procedures::SP_MoveEntityToShadowTable");
	var result = fnMoveEntitiesToShadowTable({
		I_ENTITIES: entities,
		I_USER: $.session.getUsername(),
		I_TIMESTAMP: getTimestamp()
	});
	conn.commit();
	conn.close();

	if (result && result.EX_ERROR != null) {
		return {
			body: result,
			status: $.net.http.BAD_REQUEST
		};
	} else {
		return {
			body: output,
			status: $.net.http.CREATED
		};
	}
}

var body = $.request.body.asString();
var obj = JSON.parse(body);
//console.log("body: " + body);
//console.log(obj.entities);

// validate the inputs here!
var output = moveEntitiesToShadowTable(obj.entities);
$.response.contentType = "application/json";
$.response.setBody(output.body);
$.response.status = output.status;