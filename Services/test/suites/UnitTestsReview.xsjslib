/**
 * Test suite: Match Review
 */
describe("Match Review Test Suite", function() {

	beforeEach(function() {
	});

	/**
	 * 
	 */
	it("should receive answer from match assessments service", function() {
        var requestBody = '{"param1":42,"param2":"xyz"}';
        var headers = {
            "Content-Type" : "application/json"
        };
        var response = jasmine.callHTTPService("/path/to/your/app/Service.xsjs", $.net.http.POST, requestBody, headers);
        expect(response.status).toBe($.net.http.OK);
        var body = response.body ? response.body.asString() : "";
        expect(body).toMatch(/regular expression that checks correct response/);
    });
});