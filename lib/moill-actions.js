/*
This is where all the web servicy-type interactions are defined.

Here are the actions that the moill server supports:
Lists
  response: ["name",...]
CreateList
  request:  List=
DeleteList
  request:  List=

Add
  request:  List=,Key=,Value=,[NextTo=,Position=Before||After]
Delete
  request:  List=,Key=
Move
  request:  List=,Key=,NextTo=,[Position=Before||After]
List
  request:  List=
  response: [{"Key":[key],"Value":[value]},...]

Note:
  All actions are idempotent.  So, for example, if a delete request comes in for something 
  that doesn't exist, we'll reply with a 200 rather than a 404.
*/
var IndexedLinkedList = require("./indexed-linked-list").IndexedLinkedList;

//Get Javascript stuff out of the way...
// Lifted from http://stackoverflow.com/questions/18912/how-to-find-keys-of-a-hash
Object.prototype.keys = function ()
{
    var keys = [];
    for(var i in this) if (this.hasOwnProperty(i)) {
	keys.push(i);
    }
    return keys;
}

//Helper functions
function respondSuccessJson(response, responseObject) {
    response.writeHead("200", "OK", {
	"content-type": "application/json"
    });
    if (responseObject == null) {
	response.end();
    }
    else if (responseObject.length == 0) {
	//Empty array
	response.end("[]");
    }
    else {
	response.end(JSON.stringify(responseObject));
    }
}

function respondBadRequestJson(response, message) {
    response.writeHead("400", "Bad Request", {
	"content-type": "application/json"
    });
    response.end(JSON.stringify({"Message":message}));
}

function respondNotFound(response, message) {
    response.writeHead("404", "Not Found", {
	"content-type": "application/json"
    });
    response.end(JSON.stringify({"Message":message}));  
}

function checkRequiredParameters(uparts, response, parameters) {
    for(i = 0; i < parameters.length; ++i) {
	var parameter = parameters[i];
	if(!uparts.query || !uparts.query.hasOwnProperty(parameter)) {
	    respondBadRequestJson(response, 
				  "Parameter " + parameter + " required.");
	    return false;
	}
    }
    return true;
}

//Handlers

//response: ["name",...]
function lists(request, response, uparts, ills) {
    //Sort to guarantee consistent results
    respondSuccessJson(response, ills.keys().sort());
}

//request:  List=
function createList(request, response, uparts, ills) {
    if (!checkRequiredParameters(uparts, response, ["List"])) {
	return;
    }
    var list = uparts.query.List;
    if (ills[list] == null) {
	ills[list] = new IndexedLinkedList();
    }
    respondSuccessJson(response, null);
}

//request:  List=
function deleteList(request, response, uparts, ills) {
    if (!checkRequiredParameters(uparts, response, ["List"])) {
	return;
    }
    var list = uparts.query.List;
    delete ills[list];
    respondSuccessJson(response, null);
}

//request:  List=,Key=,Value=,[NextTo=,Position=Before||After]
function addElement(request, response, uparts, ills) {
    if (!checkRequiredParameters(uparts, response, ["List","Key","Value"])) {
	return;
    }
    var list = uparts.query.List;
    var key = uparts.query.Key;
    var value = uparts.query.Value;
    if (!ills[list]) {
	respondBadRequestJson(response, "List " + list + " does not exist.");
	return;
    }
    //If key already exists, return 200, even if it is out of place.
    if (!ills[list].exists(key)) {
	//If nothing is in the list just add to the head.
	if (ills[list].getSize() < 1) {
	    ills[list].shift(key, value);
	}
	else {
	    var nextTo = uparts.query.NextTo;
	    if (nextTo == null) {
		nextTo = ills[list].getHead().getKey();
	    }
	    if (!ills[list].exists(nextTo)) {
		respondBadRequestJson(response, "List " + list + " doesn't not contain NextTo " + nextTo);
		return;
	    }
	    var position = uparts.query.Position;
	    //Default to head if NextTo and Position aren't specified.
	    if (position == "After") {
		ills[list].insertAfter(key, value, nextTo);
	    }
	    else {
		ills[list].insertBefore(key, value, nextTo);
	    }
	}
    }
    respondSuccessJson(response, null);
}

//request:  List=,Key=
function deleteElement(request, response, uparts, ills) {
    if (!checkRequiredParameters(uparts, response, ["List","Key"])) {
	return;
    }
    var list = uparts.query.List;
    var key = uparts.query.Key;
    if (!ills[list]) {
	respondBadRequestJson(response, "List " + list + " does not exist.");
	return;
    }
    if (ills[list].exists(key)) {
	ills[list].remove(key);
    }
    respondSuccessJson(response, null);
}

//request:  List=,Key=,NextTo=,[Position=Before||After]
function moveElement(request, response, uparts, ills) {
    if (!checkRequiredParameters(uparts, response, ["List","Key","NextTo"])) {
	return;
    }
    var list = uparts.query.List;
    var key = uparts.query.Key;
    var nextTo = uparts.query.NextTo;
    if (!ills[list]) {
	respondBadRequestJson(response, "List " + list + " does not exist.");
	return;
    }
    if (!ills[list].exists(key)) {
	respondBadRequestJson(response, "List " + list + " doesn't not contain Key " + key);
	return;
    }
    if (!ills[list].exists(nextTo)) {
	respondBadRequestJson(response, "List " + list + " doesn't not contain NextTo " + nextTo);
	return;
    }

    var position = uparts.query.Position;
    if(position == "After") {
	ills[list].moveAfter(key, nextTo);
    }
    else {
	ills[list].moveBefore(key, nextTo);
    }
    respondSuccessJson(response, null);  
}

//request:  List=
//response: [{"Key":[key],"Value":[value]},...]
function listElements(request, response, uparts, ills) {
    if (!checkRequiredParameters(uparts, response, ["List"])) {
	return;
    }
    var list = uparts.query.List;
    if (!ills[list]) {
	respondBadRequestJson(response, "List " + list + " does not exist.");
	return;
    }
    var returnList = new Array();
    var n = ills[list].getHead();
    while(n != null) {
	var current = new Object();
	current["Key"] = n.getKey();
	current["Value"] = n.getValue();
	returnList.push(current);
	n = n.getNext();
    }
    respondSuccessJson(response, returnList);
}

//Would really like to just use the action directly...
var actionHandlers = {
    "Lists": lists,
    "CreateList": createList,
    "DeleteList": deleteList,
    "Add": addElement,
    "Delete": deleteElement,
    "Move": moveElement,
    "List": listElements
};

//Main (effectively)
function handleRequest(request, response, uparts, ills) {
    //response.end("MoILL: " + request.url);
    var action = uparts.query.Action;
    var handler = actionHandlers[action];
    
    if (handler == null) {
	if (action == null) {
	    respondBadRequestJson(response, 
				  "Parameter Action required.");
	}
	else {
	    respondBadRequestJson(response, 
				  "Action " + action + " is invalid.");
	}
    }
    else {
	handler(request, response, uparts, ills);
    }
}

exports.handleRequest = handleRequest;