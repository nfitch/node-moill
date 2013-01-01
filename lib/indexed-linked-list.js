/*
A linked list where every node is indexed by a user-supplied key.
*/

//Internal representation of an indexed item.
function IndexedItem(key, value) {
    var _key = key;
    var _value = value;
    var _prev = null;
    var _next = null;

    this.getKey = function() {
	return _key;
    }

    this.getValue = function() {
	return _value;
    }

    this.getPrevious = function() {
	return _prev;
    }

    this.setPrevious = function(previous) {
	_prev = previous;
    }

    this.getNext = function() {
	return _next;
    }

    this.setNext = function(next) {
	_next = next;
    }

    this.dump = function() {
	return "{" + _key + "," + _value + "}";
    }
}

function IndexedLinkedList() {
    var _map = [];
    var _head = null;
    var _tail = null;
    var _size = 0;

    this.empty = function() {
	return (_size == 0);
    }

    this.getSize = function() {
	return _size;
    }

    this.getHead = function() {
	return _head;
    }

    this.getTail = function() {
	return _tail;
    }

    //Returns true if the key exists
    this.exists = function(key) {
	var ii = this.getIndexedItem(key);
	return (ii != null);
    }

    //Returns the value for the key
    this.get = function(key) {
	var ii = this.getIndexedItem(key);
	return (!ii) ? null : ii.getValue();
    }

    //Returns the IndexedItem object
    this.getIndexedItem = function(key) {
	return _map[key];
    }

    //Shifts val on the front and indexes it by key.  If the key already
    // exists this does nothing and returns false.
    this.shift = function(key, value) {
	if (_map[key]) {
	    return false;
	}
	var ii = _newItem(key, value);
	//Can't use empty() since _newItem makes size > 0
	if (_head == null) {
	    _head = ii;
	    _tail = ii;
	}
	else {
	    _insertBefore(ii, _head);
	}
	return true;
    }

    //Removes and returns the value from the front of the list.  Returns
    // null if the list is empty.
    this.unshift = function() {
	if (_head == null) {
	    return null;
	}
	return this.remove(_head.getKey());
    }

    //Pushes val on the back and indexes by key.  If the key already
    // exists this does nothing and returns false.
    this.push = function(key, value) {
	if (_map[key]) {
	    return false;
	}
	var ii = _newItem(key, value);
	//Can't use empty() since _newItem makes size > 0
	if (_tail == null) {
	    _head = ii;
	    _tail = ii;
	}
	else {
	    _insertAfter(ii, _tail);
	}
	return true;
    }
    
    //Removes and returns the value from the back of the list.  Returns
    // null if the list is empty.
    this.pop = function() {
	if (_tail == null) {
	    return null;
	}
	return this.remove(_tail.getKey());
    }

    //Inserts the value, indexed by key, after the value for
    // afterKey.  If the key already exists, this does nothing and
    // returns false.
    this.insertAfter = function(key, value, afterKey) {
	if (this.exists(key)) {
	    return false;
	}
	//Look up after
	var after = this.getIndexedItem(afterKey);
	if (!after) {
	    return false;
	}

	var ii = _newItem(key, value);
	_insertAfter(ii, after);
	return true;
    }

    //Moves the value for moveKey after the value for afterkey.
    // If one or the other does not exist, this does nothing and
    // returns false.
    this.moveAfter = function(moveKey, afterKey) {
	if (afterKey == moveKey) {
	    return true;
	}
	//Look 'em up
	var after = this.getIndexedItem(afterKey);
	var move = this.getIndexedItem(moveKey);
	if (!after || !move) {
	    return false;
	}
	//If they are already in the correct order
	if (after.getNext() == move && move.getPrevious() == after) {
	    return true;
	}

	_unlink(move);
	_insertAfter(move, after);
	return true;
    }

    //Inserts the value, indexed by key, before the value for
    // beforeKey.  If the key already exists, this does nothing and
    // returns false.
    this.insertBefore = function(key, value, beforeKey) {
	if (this.exists(key)) {
	    return false;
	}
	//Look up after
	var before = this.getIndexedItem(beforeKey);
	if (!before) {
	    return false;
	}

	var ii = _newItem(key, value);
	_insertBefore(ii, before);
	return true;
    }

    //Moves the value for moveKey before the value for beforeKey.
    // If one or the other does not exist, this does nothing and
    // returns false.
    this.moveBefore = function(moveKey, beforeKey) {
	if (beforeKey == moveKey) {
	    return true;
	}
	//Look 'em up
	var before = this.getIndexedItem(beforeKey);
	var move = this.getIndexedItem(moveKey);
	if (!before || !move) {
	    return false;
	}
	//If they are already in the correct order
	if (before.getPrevious() == move && move.getNext() == before) {
	    return true;
	}

	_unlink(move);
	_insertBefore(move, before);
	return true;
    }

    //Removes and returns the value
    this.remove = function(key) {
	var ii = this.getIndexedItem(key);
	if (ii == null) {
	    return;
	}
	_deleteItem(ii);
	return ii.getValue();
    }

    //Creates a new item but doesn't put it anywhere
    function _newItem(key, value) {
	var ii = new IndexedItem(key, value);
	_map[key] = ii;
	++_size;
	return ii;
    }

    //Removes all traces of an item out of this
    function _deleteItem(ii) {
	_unlink(ii);
	--_size;
	delete _map[ii.getKey()];
    }

    function _unlink(ii) {
	//Remove from where its at (prev)
	if (ii.getPrevious() != null) {
	    ii.getPrevious().setNext(ii.getNext());
	}
	else { //Set head
	    _head = ii.getNext();
	    if (_head != null) {
		_head.setPrevious(null);
	    }
	}
	//Remove from where its at (next)
	if (ii.getNext() != null) {
	    ii.getNext().setPrevious(ii.getPrevious());
	}
	else { //Set Tail
	    _tail = ii.getPrevious();
	    if (_tail != null) {
		_tail.setNext(null);
	    }
	}
    }

    function _insertAfter(move, after) {
	move.setPrevious(after);
	move.setNext(after.getNext());
	if (after.getNext() != null) {
	    after.getNext().setPrevious(move);
	}
	else { //Tail...
	    _tail = move;
	}
	after.setNext(move);
    }

    function _insertBefore(move, before) {
	move.setNext(before);
	move.setPrevious(before.getPrevious());
	if (before.getPrevious() != null) {
	    before.getPrevious().setNext(move);
	}
	else { //Head...
	    _head = move;
	}
	before.setPrevious(move);
    }

    //Dumps to a string
    this.dump = function() {
	var x = "{";
	var n = _head;
	while (n != null) {
	    x += n.dump();
	    if (n.getNext() != null) {
		x += ",";
	    }
	    n = n.getNext();
	}
	x += "}";
	return x;
    }
}

exports.IndexedItem = IndexedItem;
exports.IndexedLinkedList = IndexedLinkedList;
