/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

var SqlExecutor = $.import('sap.hana.testtools.unit.util', 'sqlExecutor').SqlExecutor;
var tableDataSet = $.import('sap.hana.testtools.unit.util', 'tableDataSet');
/*****************************************************************************************************************
 * Test suite: Generate Subgroups
 * 
 * NB -> For more info on using XSJS test libraries, refer to:	https://goo.gl/NhbXYR
 * 
******************************************************************************************************************

Release LOG:

SI007 - R.Silva - 27.09.2018

Test Cases:

- Generate SubGroup V2 - based on Graph traversal

******************************************************************************************************************/

describe("Generate SubGroup Test Suite", function() {


	// before all test cases
	beforeOnce(function() {

		sqlExecutor = new SqlExecutor(jasmine.dbConnection);

		var testSP = ' \"osr.scv.foundation.db.Procedures::SP_GenerateScvSubgroups\"( 0, ?, ?) ';

		// Execute test Stored Procedure
		var callStatement = 'CALL ' + testSP + ';';
		
		var actual = sqlExecutor.execSingleIgnoreFailing(callStatement);
		
	});


	// before each test case
	beforeEach(function() {
		sqlExecutor = new SqlExecutor(jasmine.dbConnection);
	});



	// Test case - execute SubGroups
	it("CASE " + "Generate SugGroup - 238787 ", function() {


		//
		//  *** enter here the SQL procedure that runs the test case
		//
		var testSP = ' \"osr.scv.foundation.db.Procedures.Test::SP_TestGenerateSCVSubgroupsV2\"( 238787, ?) ';

		// Execute test Stored Procedure
		var callStatement = 'CALL ' + testSP + ';';
		
		var actual = sqlExecutor.execQuery(callStatement);
		
		//  Assertion
		expect(actual.getRow(0).O_RETURN_CODE).toBe("2");
		
        
        
	});	
	
	// Test case - execute SubGroups
	it("CASE " + "Generate SugGroup - 767515 ", function() {


		//
		//  *** enter here the SQL procedure that runs the test case
		//
		var testSP = ' \"osr.scv.foundation.db.Procedures.Test::SP_TestGenerateSCVSubgroupsV2\"( 767515, ?) ';


		// Execute test Stored Procedure
		var callStatement = 'CALL ' + testSP + ';';
		
		var actual = sqlExecutor.execQuery(callStatement);
		
		//  Assertion
		expect(actual.getRow(0).O_RETURN_CODE).toBe("1");
		
       
	});	


});