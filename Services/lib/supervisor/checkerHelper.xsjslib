/*
 * Created by Stefanus
 * A library to help to check for system validation
 * Can be enhance to help other modules if necessary 
 * 23.08.2018 
 */

"use strict";

/**
 * get chosen if we are only searching the source id. 
 * NOT NULL is used for fail safe in case there's NULL happening
 * on the Search table. 
 */
function getCurrentProcedureRunning(oConn) {

	let sCurrentSchemaName = getCurrentContainerSchemaName(oConn);

	//3 current procedures that is being called to PROMOTE SCV in the order below. 
	//source of procedures name is in moveEntitiesToShadowTable.xsjs

	// 1 "osr.scv.foundation.db.Procedures::SP_MoveEntityToShadowTable"
	// 2 "osr.scv.foundation.db.Procedures::SP_MoveRowsToScvFoundation" 
	// 3 "osr.scv.foundation.db.Procedures::SP_BuildScvSearchTable"
	let oResult;
	let bIsExecuting;

	// ############################ PROCESS DELTA ############################ //
	let sProcessScv = "SELECT \"PROCEDURE_NAME\", \"STATEMENT_STATUS\" " +
		"FROM \"osr.scv.foundation.db.synonyms::ACTIVE_PROCEDURES\" WHERE \"PROCEDURE_SCHEMA_NAME\" LIKE ? " +
		"AND \"STATEMENT_STRING\" LIKE ? " +
		"AND \"PROCEDURE_NAME\" = 'osr.scv.foundation.db.Procedures::SP_ProcessScvDelta' ";
	let ptsmt = oConn.prepareStatement(sProcessScv);
	ptsmt.setString(1, sCurrentSchemaName);
	ptsmt.setString(2, "%CALL%");
	oResult = ptsmt.executeQuery();

	bIsExecuting = _bRowsChecker(oResult._rows);

	if (bIsExecuting) {
		return true;
	}

	// ############################ MOVE ENTITY SHADOW TABLE ############################ //
	let sShadowTableQuery = "SELECT * " +
		"FROM \"osr.scv.foundation.db.synonyms::ACTIVE_PROCEDURES\" WHERE \"PROCEDURE_SCHEMA_NAME\" LIKE ? " +
		"AND \"STATEMENT_STRING\" LIKE ? " +
		"AND \"PROCEDURE_NAME\" = 'osr.scv.foundation.db.Procedures::SP_MoveEntityToShadowTable' ";
	ptsmt = oConn.prepareStatement(sShadowTableQuery);
	ptsmt.setString(1, sCurrentSchemaName);
	ptsmt.setString(2, "%CALL%");
	oResult = ptsmt.executeQuery();

	bIsExecuting = _bRowsChecker(oResult._rows);

	if (bIsExecuting) {
		return true;
	}

	// ############################ MOVE ROWS TO SCV FOUNDATION ############################ //
	let sMoveToScvFoundationQuery = "SELECT * " +
		"FROM \"osr.scv.foundation.db.synonyms::ACTIVE_PROCEDURES\" WHERE \"PROCEDURE_SCHEMA_NAME\" LIKE ? " +
		"AND \"STATEMENT_STRING\" LIKE ? " +
		"AND \"PROCEDURE_NAME\" = 'osr.scv.foundation.db.Procedures::SP_MoveRowsToScvFoundation' ";
	ptsmt = oConn.prepareStatement(sMoveToScvFoundationQuery);
	ptsmt.setString(1, sCurrentSchemaName);
	ptsmt.setString(2, "%CALL%");
	oResult = ptsmt.executeQuery();

	bIsExecuting = _bRowsChecker(oResult._rows);

	if (bIsExecuting) {
		return true;
	}

	// ############################ BUILD SEARCH TABLE ############################ //
	let sBuildSearchTable = "SELECT * " +
		"FROM \"osr.scv.foundation.db.synonyms::ACTIVE_PROCEDURES\" WHERE \"PROCEDURE_SCHEMA_NAME\" LIKE ? " +
		"AND \"STATEMENT_STRING\" LIKE ? " +
		"AND \"PROCEDURE_NAME\" = 'osr.scv.foundation.db.Procedures::SP_BuildScvSearchTable' ";
	ptsmt = oConn.prepareStatement(sBuildSearchTable);
	ptsmt.setString(1, sCurrentSchemaName);
	ptsmt.setString(2, "%CALL%");
	oResult = ptsmt.executeQuery();

	bIsExecuting = _bRowsChecker(oResult._rows);

	if (bIsExecuting) {
		return true;
	}

	return false;
}

function _bRowsChecker(aRows) {
	if (aRows.length > 0) {
		for (let i = 0; i < aRows.length; i++) {
			if (aRows[i].STATEMENT_STATUS === "EXECUTING") {
				return true;
			}
		}
		return false;
	} else {
		return false;
	}

}

function getCurrentContainerSchemaName(oConn) {

	let sSqlQuery = "SELECT \"SCHEMA_NAME\" FROM \"SYS\".\"SCHEMAS\" WHERE \"SCHEMA_NAME\" LIKE '%SCV%'";
	let ptsmt = oConn.prepareStatement(sSqlQuery);
	let oResult = ptsmt.executeQuery();
	let aRows = oResult._rows;
	let sSchemaName;
	for (let i = 0; i < aRows.length; i++) {
		sSchemaName = aRows[i].SCHEMA_NAME;
	}

	return sSchemaName;
}