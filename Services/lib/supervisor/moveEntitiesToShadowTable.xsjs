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
 * Load SP_MoveEntityToShadowTable procedure and call it. 
 * @param  {[Object]} dbConn [the given DB conn]
 * @return {[type]}        [description]
 */
function moveEntitiesToShadowTable(conn) {

	var fnMoveEntitiesToShadowTable = conn.loadProcedure("osr.scv.foundation.db.Procedures::SP_MoveEntityToShadowTable");
	var result = fnMoveEntitiesToShadowTable({
		//I_ENTITIES: entities,
		I_USER: $.session.getUsername(),
		I_TIMESTAMP: getTimestamp()
	});

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

/**
 * Load SP_BuildScvSearchTable procedure and call it. 
 * Can be modified to spit out sucess / fail of the procedure and return accordingly.
 * @param  {[Object]} dbConn [the given DB conn]
 * @return {[type]}        [description]
 */
function moveEntitiesToSearchTable(dbConn) {

	let fnMoveToSearchTable = dbConn.loadProcedure("osr.scv.foundation.db.Procedures::SP_BuildScvSearchTable");
	fnMoveToSearchTable();
}

/**
 * Load SP_MoveRowsToScvFoundation procedure and call it. 
 * Can be modified to spit out sucess / fail of the procedure and return accordingly.
 * @param  {[Object]} dbConn [the given DB conn]
 * @return {[type]}        [description]
 */
function moveRowsToScvFoundationTable(dbConn) {

	let fnMoveToScvFoundationTable = dbConn.loadProcedure("osr.scv.foundation.db.Procedures::SP_MoveRowsToScvFoundation");
	fnMoveToScvFoundationTable();
}

try {
	// validate the inputs here!
	
	$.response.status = $.net.http.OK;
	response = {
		"status": "success",
		"data": {},
		"message": "Request successful!"
	};
	$.response.setBody(response);
	
	
	let oConn = $.hdb.getConnection();
	var output = moveEntitiesToShadowTable(oConn);
	moveRowsToScvFoundationTable(oConn);
	moveEntitiesToSearchTable(oConn);

	//commit everything and close the entire db connection for clean up.
	oConn.commit();
	oConn.close();

	//old code to adjust once check is in place.
	// var response = {};
	// if (output.result === "ERROR") {
	// 	$.response.status = 500;
	// 	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	// 	response = {
	// 		"status": "error",
	// 		"data": {},
	// 		"message": "Internal server error!"
	// 	};
	// 	$.response.setBody(response);
	// } else {
	// 	$.response.status = 201;
	// 	$.response.status = $.net.http.CREATED;
	// 	response = {
	// 		"status": "success",
	// 		"data": {},
	// 		"message": "Request successful!"
	// 	};
	// 	$.response.setBody(response);
	// }
} catch (err) {
	$.response.setBody("Error occured " + err);
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
} finally {
	if (typeof oConn !== "undefined") {
		oConn.close();
	}
}