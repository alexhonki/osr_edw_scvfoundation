/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

var SqlExecutor = $.import('sap.hana.testtools.unit.util', 'sqlExecutor').SqlExecutor;
var tableDataSet = $.import('sap.hana.testtools.unit.util', 'tableDataSet');
/*****************************************************************************************************************
 * Test suite: Match Subgroup
******************************************************************************************************************

Release LOG:

SI007 - R.Silva - 27.09.2018

Test Cases:

- Match results integrity
- Match results Other

******************************************************************************************************************/

describe("Match Review Test Suite", function() {


	// before all test cases
	beforeOnce(function() {

		sqlExecutor = new SqlExecutor(jasmine.dbConnection);

	});


	// before each test case
	// beforeEach(function() {
	// });


	// Test case - execute SubGroups
	it("CASE " + "Match results integrity", function() {


		//
		//  *** enter here the SQL procedure that runs the test case
		//
		var testSP = ' \"osr.scv.foundation.db.Procedures.Test::SP_TestMatchResultsIntegrity\"(?) ';
		var testSuccess = "SUCCESS";

		//
		//  *** enter here expected result (O_RETURN_CODE is the key to it)
		//
		var expectedData = {
			"O_TEST_ID": ["Match results integrity"],
			"O_RETURN_CODE": [testSuccess]
		};	

		// Execute test Stored Procedure
		var callStatement = 'CALL ' + testSP + ';';
		var actual = sqlExecutor.execQuery(callStatement);
		$.trace.info(actual);   	
		
		//  Assertion
		expect(actual).toMatchData(expectedData, [ "O_RETURN_CODE" ]);
		
        
	});
	
	// Test case - execute SubGroups
	it("CASE " + 'Match results other test', function() {


		//
		//  *** enter here the SQL procedure that runs the test case
		//
		var testSP = ' \"osr.scv.foundation.db.Procedures.Test::SP_TestMatchResultsOtherTest\"(?) ';
		var testSuccess = "SUCCESS";

		//
		//  *** enter here expected result (O_RETURN_CODE is the key to it)
		//
		var expectedData = {
			"O_TEST_ID": ['Match results other test'],
			"O_RETURN_CODE": [testSuccess]
		};	

		// Execute test Stored Procedure
		var callStatement = 'CALL ' + testSP + ';';
		var actual = sqlExecutor.execQuery(callStatement);
		$.trace.info(actual);   	
		
		//  Assertion
		expect(actual).toMatchData(expectedData, [ "O_RETURN_CODE" ]);
		
        
	});

});