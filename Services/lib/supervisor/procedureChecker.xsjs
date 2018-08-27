//import xsjslib library depending on our need.
let oHelperChecker = $.import("supervisor", "checkerHelper");

try {
	//definition of all different variables.
	let oConn = $.db.getConnection();
	let bExecutionStatus = oHelperChecker.getCurrentProcedureRunning(oConn);


	$.response.contentType = "application/json";
	$.response.setBody(bExecutionStatus);
	$.response.status = $.net.http.OK;

	oConn.close();

} catch (e) {
	$.response.setBody('Error in request!: ' + e.message);
	$.response.status = $.net.http.BAD_REQUEST;
} finally {
	if (typeof oConn !== "undefined") {
		oConn.close();
	}
}
