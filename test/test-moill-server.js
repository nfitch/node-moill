/*
Tests for the MoILL server.
*/
var assert = require('assert');
var http = require('http');
var MoillServer = require('../lib/moill-server.js').MoillServer;
var request = require('request');
var step = require('step');

//Start the server
var server = new MoillServer();
server.startTestServer();
console.log("Started test server on port " + server.getPort());

var port = server.getPort();
var url = "http://localhost:" + port + "/";
var moillUrl = url + "moill";

//Sometimes those serial tests are just the way to go...
step(
    //No action
    function testNoAction() {
	request ({
            method: "GET",
            uri: moillUrl
        }, this);
    },
    function checkNoAction(error, response, body) {
	checkResponse("", error, response, body, 400, 
		      getErrorBody("Parameter Action required."));
	return true;
    },
    //Action not found
    function testActionNotFound() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=DoesNotExist"
        }, this);
    },
    function checkActionNotFound(error, response, body) {
	checkResponse("testActionNotFound", error, response, body, 400, 
		      getErrorBody("Action DoesNotExist is invalid."));
	return true;
    },

    //--- Test actions on lists ---//

    //No lists
    function testNoLists() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=Lists"
        }, this);
    },
    function checkNoLists(error, response, body) {
	checkResponse("testNoLists", error, response, body, 200, "[]");
	return true;
    },
    //Create list, no list name
    function testCreateListNoListName() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=CreateList"
        }, this);
    },
    function checkCreateListNoListName(error, response, body) {
	checkResponse("testCreateListNoListName", error, response, body,
		      400, getErrorBody("Parameter List required."));
	return true;
    },    
    //Create list
    function testCreateList1() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=CreateList&List=list1"
        }, this);
    },
    function checkCreateList1(error, response, body) {
	checkResponse("testCreateList1", error, response, body,
		      200, null);
	return true;
    },
    //Create list, check idempotency
    function testCreateList1Idempotent() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=CreateList&List=list1"
        }, this);
    },
    function checkCreateList1Idempotent(error, response, body) {
	checkResponse("testCreateList1Idempotent", error, response, body,
		      200, null);
	return true;
    },
    //Create another
    function testCreateList2() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=CreateList&List=list2"
        }, this);
    },
    function checkCreateList2(error, response, body) {
	checkResponse("testCreateList2", error, response, body,
		      200, null);
	return true;
    },
    //List them
    function testTwoLists() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=Lists"
        }, this);
    },
    function checkTwoLists(error, response, body) {
	checkResponse("testTwoLists", error, response, body, 200, "[\"list1\",\"list2\"]");
	return true;
    },
    //Delete the second
    function testDeleteList2() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=DeleteList&List=list2"
        }, this);
    },
    function checkDeleteList2(error, response, body) {
	checkResponse("testDeleteList2", error, response, body,
		      200, null);
	return true;
    },
    //Delete the second, check idempotency
    function testDeleteList2Idempotent() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=DeleteList&List=list2"
        }, this);
    },
    function checkDeleteList2Idempotent(error, response, body) {
	checkResponse("testDeleteList2Idempotent", error, response, body,
		      200, null);
	return true;
    },
    //List again
    function testListAfterDelete() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=Lists"
        }, this);
    },
    function checkListAfterDelete(error, response, body) {
	checkResponse("testListAfterDelete", error, response, body, 200, 
		      "[\"list1\"]");
	return true;
    },

    //-- Test actions on a list --//

    //List list that doesn't exist
    function testListDoesntExist() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=List&List=list2"
        }, this);
    },
    function checkListDoesntExist(error, response, body) {
	checkResponse("testListDoesntExist", error, response, body, 400, 
		      getErrorBody("List list2 does not exist."));
	return true;
    },
    //List empty list
    function testListEmpty() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=List&List=list1"
        }, this);
    },
    function checkListEmpty(error, response, body) {
	checkResponse("testListEmpty", error, response, body, 200, "[]");
	return true;
    },

    //-- Test adding to lists --//

    //Shift four
    function testShiftFour() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=Add&List=list1&Key=four&Value=4"
        }, this);
    },
    function checkShiftFour(error, response, body) {
	checkResponse("testShiftFour", error, response, body, 200, null);
	return true;
    },
    function testListFour() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=List&List=list1"
        }, this);
    },
    function checkListFour(error, response, body) {
	checkResponse("testListFour", error, response, body, 200, "[{\"Key\":\"four\",\"Value\":\"4\"}]");
	return true;
    },
    //Shift one
    function testShiftOne() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=Add&List=list1&Key=one&Value=1"
        }, this);
    },
    function checkShiftOne(error, response, body) {
	checkResponse("testShiftOne", error, response, body, 200, null);
	return true;
    },
    function testListAfterShiftOne() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=List&List=list1"
        }, this);
    },
    function checkListAfterShiftOne(error, response, body) {
	checkResponse("testListAfterShiftOne", error, response, body, 200, "[{\"Key\":\"one\",\"Value\":\"1\"},{\"Key\":\"four\",\"Value\":\"4\"}]");
	return true;
    },
    //Two after one
    function testAddTwoAfterOne() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=Add&List=list1&Key=two&Value=2&NextTo=one&Position=After"
        }, this);
    },
    function checkAddTwoAfterOne(error, response, body) {
	checkResponse("testAddTwoAfterOne", error, response, body, 200, null);
	return true;
    },
    function testListAfterAddTwoAfterOne() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=List&List=list1"
        }, this);
    },
    function checkListAfterAddTwoAfterOne(error, response, body) {
	checkResponse("testListAfterAddTwoAfterOne", error, response, body, 200, "[{\"Key\":\"one\",\"Value\":\"1\"},{\"Key\":\"two\",\"Value\":\"2\"},{\"Key\":\"four\",\"Value\":\"4\"}]");
	return true;
    },
    //Three before four
    function testAddThreeBeforeFour() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=Add&List=list1&Key=three&Value=3&NextTo=four"
        }, this);
    },
    function checkAddThreeBeforeFour(error, response, body) {
	checkResponse("testAddThreeBeforeFour", error, response, body, 200, null);
	return true;
    },
    function testListAfterAddThreeBeforeFour() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=List&List=list1"
        }, this);
    },
    function checkListAfterAddThreeBeforeFour(error, response, body) {
	checkResponse("testListAfterAddThreeBeforeFour", error, response, body, 200, "[{\"Key\":\"one\",\"Value\":\"1\"},{\"Key\":\"two\",\"Value\":\"2\"},{\"Key\":\"three\",\"Value\":\"3\"},{\"Key\":\"four\",\"Value\":\"4\"}]");
	return true;
    },
    //Three before four, check idempotency
    function testAddThreeBeforeFourIdempotent() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=Add&List=list1&Key=three&Value=3&NextTo=four"
        }, this);
    },
    function checkAddThreeBeforeFourIdempotent(error, response, body) {
	checkResponse("testAddThreeBeforeFourIdempotent", error, response, body, 200, null);
	return true;
    },
    function testListAfterAddThreeBeforeFourIdempotent() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=List&List=list1"
        }, this);
    },
    function checkListAfterAddThreeBeforeFourIdempotent(error, response, body) {
	checkResponse("testListAfterAddThreeBeforeFourIdempotent", error, response, body, 200, "[{\"Key\":\"one\",\"Value\":\"1\"},{\"Key\":\"two\",\"Value\":\"2\"},{\"Key\":\"three\",\"Value\":\"3\"},{\"Key\":\"four\",\"Value\":\"4\"}]");
	return true;
    },

    //-- Test moving in lists --//

    //Move one to the end (after four)
    function testMoveOneToTheEnd() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=Move&List=list1&Key=one&NextTo=four&Position=After"
        }, this);
    },
    function checkMoveOneToTheEnd(error, response, body) {
	checkResponse("testMoveOneToTheEnd", error, response, body, 200, null);
	return true;
    },
    function testListAfterMoveOneToTheEnd() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=List&List=list1"
        }, this);
    },
    function checkListAfterMoveOneToTheEnd(error, response, body) {
	checkResponse("testListAfterMoveOneToTheEnd", error, response, body, 200, "[{\"Key\":\"two\",\"Value\":\"2\"},{\"Key\":\"three\",\"Value\":\"3\"},{\"Key\":\"four\",\"Value\":\"4\"},{\"Key\":\"one\",\"Value\":\"1\"}]");
	return true;
    },
    //Move one before three
    function testMoveOneBeforeThree() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=Move&List=list1&Key=one&NextTo=three"
        }, this);
    },
    function checkMoveOneBeforeThree(error, response, body) {
	checkResponse("testMoveOneBeforeThree", error, response, body, 200, null);
	return true;
    },
    function testListAfterMoveOneBeforeThree() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=List&List=list1"
        }, this);
    },
    function checkListAfterMoveOneBeforeThree(error, response, body) {
	checkResponse("testListAfterMoveOneBeforeThree", error, response, body, 200, "[{\"Key\":\"two\",\"Value\":\"2\"},{\"Key\":\"one\",\"Value\":\"1\"},{\"Key\":\"three\",\"Value\":\"3\"},{\"Key\":\"four\",\"Value\":\"4\"}]");
	return true;
    },
    //Move one before three, check idempotency
    function testMoveOneBeforeThreeIdempotent() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=Move&List=list1&Key=one&NextTo=three"
        }, this);
    },
    function checkMoveOneBeforeThreeIdempotent(error, response, body) {
	checkResponse("testMoveOneBeforeThreeIdempotent", error, response, body, 200, null);
	return true;
    },
    function testListAfterMoveOneBeforeThreeIdempotent() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=List&List=list1"
        }, this);
    },
    function checkListAfterMoveOneBeforeThreeIdempotent(error, response, body) {
	checkResponse("testListAfterMoveOneBeforeThreeIdempotent", error, response, body, 200, "[{\"Key\":\"two\",\"Value\":\"2\"},{\"Key\":\"one\",\"Value\":\"1\"},{\"Key\":\"three\",\"Value\":\"3\"},{\"Key\":\"four\",\"Value\":\"4\"}]");
	return true;
    },

    //-- Test deleting in lists --//

    //Delete in the middle
    function testDeleteThree() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=Delete&List=list1&Key=three"
        }, this);
    },
    function checkDeleteThree(error, response, body) {
	checkResponse("testDeleteThree", error, response, body, 200, null);
	return true;
    },
    function testListAfterDeleteThree() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=List&List=list1"
        }, this);
    },
    function checkListAfterDeleteThree(error, response, body) {
	checkResponse("testLisAfterDeleteThree", error, response, body, 200, "[{\"Key\":\"two\",\"Value\":\"2\"},{\"Key\":\"one\",\"Value\":\"1\"},{\"Key\":\"four\",\"Value\":\"4\"}]");
	return true;
    },
    //Delete in the middle, check idempotency
    function testDeleteThreeIdempotent() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=Delete&List=list1&Key=three"
        }, this);
    },
    function checkDeleteThreeIdempotent(error, response, body) {
	checkResponse("testDeleteThree", error, response, body, 200, null);
	return true;
    },
    function testListAfterDeleteThreeIdempotent() {
	request ({
            method: "GET",
            uri: moillUrl + "?Action=List&List=list1"
        }, this);
    },
    function checkListAfterDeleteThreeIdempotent(error, response, body) {
	checkResponse("testLisAfterDeleteThreeIdempotent", error, response, body, 200, "[{\"Key\":\"two\",\"Value\":\"2\"},{\"Key\":\"one\",\"Value\":\"1\"},{\"Key\":\"four\",\"Value\":\"4\"}]");
	return true;
    },

    //Clean up by shutting down the server.
    function shutDown(err, result) {
	server.close();
	console.log("Shut down server...");
    }
)

function checkResponse(testName, error, response, body, 
		       expectedStatusCode, expectedBody) {
    try {
	assert.equal(response.statusCode, expectedStatusCode, 
		     "Status code (" + response.statusCode + 
		     ") doesn't equal expected status code (" + 
		     expectedStatusCode + "), body was: " + body + ".");
	assert.equal(body, expectedBody, "Body (" + body + 
		     ") doesn't equal expected body (" + expectedBody + 
		     ").");
    }
    catch (err) {
	console.log(testName + " failed with: " + err);
    }
}

function getErrorBody(message) {
    return "{\"Message\":\"" + message + "\"}";
}