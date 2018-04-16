/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/
var SqlExecutor = $.import('sap.hana.testtools.unit.util', 'sqlExecutor').SqlExecutor;
var mockstarEnvironment = $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');
var tableDataSet = $.import('sap.hana.testtools.unit.util', 'tableDataSet');

/**
 * Test suite: Match Review
 */
describe("Match Review Test Suite", function() {

	var testEnvironment = null;
	
	/**
	 * This is the expected result
	 */ 
	
	function addResult(){
	/*
	   var resultData = {
		    "O_TEST_ID" : "Match results integrity",
		    "O_RETURN_CODE" : "SUCCESS"
		};
		testEnvironment.fillTestTable("results",resultData);
	*/
	}
	
	/**
	 * Define the model definition and create instance of mockstar environment
	 */
	
	beforeOnce(function() {
	/*
		var definition = {
				schema : "",
				model : {
					schema : '',
					name : 'osr.scv.foundation.db.Procedures.Test::SP_TestMatchResultsIntegrity'
				},
				substituteTables : {
					"results" : "osr.scv.foundation.db.data::TestResults.Results"
				}
		};
		testEnvironment = mockstarEnvironment.defineAndCreate(definition); 
	*/
		
	});
	
	/**
	 * Delete test results between test executions
	 */ 
	beforeEach(function() {
		//testEnvironment.clearAllTestTables();
	});

	/**
	 * Test match result integrity
	 */
	it("test match results integrity", function() {
    	
		//addResult();
		
		var callStatement = 'CALL ' + '\"osr.scv.foundation.db.Procedures.Test::SP_TestMatchResultsIntegrity\"(?);';
    	var callable = jasmine.dbConnection.prepareCall(callStatement);
    	callable.execute();
    	var resultSet = tableDataSet.createFromResultSet(callable.getResultSet());
    	callable.close();
    	
    	var expectedData = {
    		"O_TEST_ID": ["Match results integrity"],
    		"O_RETURN_CODE": ["SUCCESS"]
    	};
    	expect(resultSet).toMatchData(expectedData, ["O_TEST_ID"]);
    });
});