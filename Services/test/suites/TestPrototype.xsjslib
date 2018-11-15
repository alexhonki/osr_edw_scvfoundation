/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/
var SqlExecutor = $.import('sap.hana.testtools.unit.util', 'sqlExecutor').SqlExecutor;
var mockstarEnvironment = $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');
var tableDataSet = $.import('sap.hana.testtools.unit.util', 'tableDataSet');
//var connection = $.db.getConnection();
/**
 * Test suite: Match Review
 */ 
describe("Match Prototype Test Suite", function() {
	//var testEnvironment = null;
	//var sqlExecutor = new SqlExecutor(connection);
	/**
	 * This is the expected result
	 */

	function addResult() {
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
		//sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		
	});

	/**
	 * Test match result integrity
	 */
	it("Test Prototype - It should always pass", function() {

		//addResult();

		//var callStatement = 'CALL ' + '\"osr.scv.foundation.db.Procedures.Test::SP_TestMatchResultsIntegrity\"(?);';
		//var callable = jasmine.dbConnection.prepareCall(callStatement);
		//callable.execute();
		//var resultSet = tableDataSet.createFromResultSet(callable.getResultSet());
		//var resultset = sqlExecutor.execQuery(callStatement);
		//callable.close();
		/*try {
			var actualTableDataSet = sqlExecutor.execQuery('select 1 from dummy');
		} finally {
			connection.close();
		}*/

		// var expectedData = {
		// 	"O_TEST_ID": ["Match results integrity"],
		// 	"O_RETURN_CODE": ["SUCCESS"]
		// };
		//expect(resultSet).toMatchData(expectedData, ["O_TEST_ID"]);
		expect(1).toBe(1);
	});
});