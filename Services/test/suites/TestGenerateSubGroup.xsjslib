/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/
 
var SqlExecutor = $.import('sap.hana.testtools.unit.util', 'sqlExecutor').SqlExecutor;
var tableDataSet = $.import('sap.hana.testtools.unit.util', 'tableDataSet');
/*****************************************************************************************************************
 * Test suite: Generate Subgroups
 * 
 * NB -> For more info on using XSJS test libraries, refer to:	https://goo.gl/NhbXYR 
 *																and https://goo.gl/R8DJtn
 *		
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

		var testSP = ' \"osr.scv.foundation.db.Procedures::SP_GenerateScvSubgroupsV20\"( 0, ?, ?) ';

		// Execute test Stored Procedure
		var callStatement = 'CALL ' + testSP + ';';
		
		var actual = sqlExecutor.execSingleIgnoreFailing(callStatement);
		
	});


	// before each test case
	beforeEach(function() {
		sqlExecutor = new SqlExecutor(jasmine.dbConnection);
	});



	// Test case - execute SubGroups
	it("CASE " + "Generate SugGroup - 730360 ", function() {


		//
		//  *** enter here the SQL procedure that runs the test case
		//
		const testSP = ' \"osr.scv.foundation.db.Procedures.Test::SP_TestGenerateSCVSubgroupsV2\"( 730360, ?) ';

		// Execute test Stored Procedure
		const callStatement = 'CALL ' + testSP + ';';
		
		const actual = sqlExecutor.execQuery(callStatement);
		
		//  Assertions
		
		try {
			expect(actual.getRow(0).O_RETURN_CODE + " groups").toBe("2 groups");
			expect(actual.getRow(1).O_RETURN_CODE).toBe("3");
			expect(actual.getRow(2).O_RETURN_CODE).toBe("3");

		} catch (e) {
			expect("Error in SQL").toBe("No error");			
		}
        
        
	});	
	
	// Test case - execute SubGroups
	it("CASE " + "Generate SugGroup - 575719 ", function() {


		//
		//  *** enter here the SQL procedure that runs the test case
		//
		const testSP = ' \"osr.scv.foundation.db.Procedures.Test::SP_TestGenerateSCVSubgroupsV2\"( 575719, ?) ';


		// Execute test Stored Procedure
		const callStatement = 'CALL ' + testSP + ';';
		
		const actual = sqlExecutor.execQuery(callStatement);
		
		try {
			expect(actual.getRow(0).O_RETURN_CODE + " group").toBe("1 group");
			expect(actual.getRow(1).O_RETURN_CODE).toBe("10");

		} catch (e) {
			expect("Error in SQL").toBe("No error");			
		}
        
		
       
	});	


	// Test case - execute SubGroups
	it("CASE " + "Generate SugGroup - 1797941 ", function() {


		//
		//  *** enter here the SQL procedure that runs the test case
		//
		const testSP = ' \"osr.scv.foundation.db.Procedures.Test::SP_TestGenerateSCVSubgroupsV2\"( 1797941, ?) ';


		// Execute test Stored Procedure
		const callStatement = 'CALL ' + testSP + ';';
		
		const actual = sqlExecutor.execQuery(callStatement);
		
		try {
			expect(actual.getRow(0).O_RETURN_CODE + " group").toBe("1 group");
			expect(actual.getRow(1).O_RETURN_CODE).toBe("7");

		} catch (e) {
			expect("Error in SQL").toBe("No error");			
		}
        
		
       
	});	

	// Test case - execute SubGroups
	it("CASE " + "Generate SugGroup - 2384502 ", function() {


		//
		//  *** enter here the SQL procedure that runs the test case
		//
		const testSP = ' \"osr.scv.foundation.db.Procedures.Test::SP_TestGenerateSCVSubgroupsV2\"( 2384502, ?) ';


		// Execute test Stored Procedure
		const callStatement = 'CALL ' + testSP + ';';
		
		const actual = sqlExecutor.execQuery(callStatement);
		
		try {
			expect(actual.getRow(0).O_RETURN_CODE + " groups").toBe("2 groups");
			expect(actual.getRow(1).O_RETURN_CODE).toBe("3");
			expect(actual.getRow(2).O_RETURN_CODE).toBe("3");
			
		} catch (e) {
			expect("Error in SQL").toBe("No error");			
		}
        
		
       
	});	

});