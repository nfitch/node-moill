/*
Tests for the Indexed Linked List.
*/
var util = require('util');
var IndexedLinkedList = require("../lib/indexed-linked-list").IndexedLinkedList;
var assert = require('assert');

var ill;

//-- Test shift and unshift --//
ill = new IndexedLinkedList();

//Shift on one
assert.ok(ill.shift(5, 5));
verify(ill, [5]);

//Shift on many more
for(i = 4; i > 0; --i) {
    assert.ok(ill.shift(i, i));
}
verify(ill, [1, 2, 3, 4, 5]);

//Shift them all off
for(i = 1; i <= 5; ++i) {
    assert.equal(ill.unshift(), i);
}
verify(ill, []);
assert.equal(ill.unshift(), null);

//-- Test push and pop --//
ill =  new IndexedLinkedList();

//Push on one
assert.ok(ill.push(1, 1));
verify(ill, [1]);

//Push on many more
for(i = 2; i <= 5; ++i) {
    assert.ok(ill.push(i, i));
}
verify(ill, [1, 2, 3, 4, 5]);

//Pop them all off
for(i = 5; i > 0; --i) {
    assert.equal(ill.pop(), i);
}
verify(ill, []);
assert.equal(ill.pop(), null);

//-- Test get --//
ill = getFive();

for(i = 1; i <= 5; ++i) {
    assert.equal(ill.get(i), i);
}

//-- Test exists --//
ill = getFive();

for(i = 1; i <= 5; ++i) {
    assert.ok(ill.exists(i));
}
assert.ok(!ill.exists(6));
assert.ok(!ill.exists(-1));
assert.ok(!ill.exists("foo"));

//-- Test remove --//
ill = getFive();

//Remove from middle
assert.equal(ill.remove(3), 3, "Didn't return 3");
verify(ill, [1, 2, 4, 5]);

//Remove head
assert.equal(ill.remove(1), 1, "Didn't return 1");
verify(ill, [2, 4, 5]);

//Remove tail
assert.equal(ill.remove(5), 5, "Didn't return 5");
verify(ill, [2, 4]);

//Remove the rest
assert.equal(ill.remove(2), 2, "Didn't return 2");
assert.equal(ill.remove(4), 4, "Didn't return 4");
assert.equal(ill.getSize(), 0);
assert.equal(ill.getHead(), null);
assert.equal(ill.getTail(), null);

//-- Test moveAfter --//
ill = getFive();

//Move from front to end
assert.ok(ill.moveAfter(1, 5));
verify(ill, [2, 3, 4, 5, 1]);

//Move from front to middle
assert.ok(ill.moveAfter(2, 4));
verify(ill, [3, 4, 2, 5, 1]);

//Move from middle to middle
assert.ok(ill.moveAfter(4, 5));
verify(ill, [3, 2, 5, 4, 1]);

//Move from end to middle
assert.ok(ill.moveAfter(1, 3));
verify(ill, [3, 1, 2, 5, 4]);

//Move from middle to end
assert.ok(ill.moveAfter(2, 4));
verify(ill, [3, 1, 5, 4, 2]);

//Swap 2 elements in the middle
assert.ok(ill.moveAfter(5, 4));
verify(ill, [3, 1, 4, 5, 2]);

//Swap 2 elements at the end
assert.ok(ill.moveAfter(5, 2));
verify(ill, [3, 1, 4, 2, 5]);

//Swap 2 elements at the beginning
assert.ok(ill.moveAfter(3, 1));
verify(ill, [1, 3, 4, 2, 5]);

//Back to order
assert.ok(ill.moveAfter(2, 1));
verify(ill, [1, 2, 3, 4, 5]);

//Move the "same" element
assert.ok(ill.moveAfter(3, 3));
assert.ok(ill.moveAfter(1, 1));
assert.ok(ill.moveAfter(5, 5));

//Elements in order already
assert.ok(ill.moveAfter(4, 3));
verify(ill, [1, 2, 3, 4, 5]);

//-- Test moveBefore --//
ill = getFive();

//Move from end to front
assert.ok(ill.moveBefore(5, 1));
verify(ill, [5, 1, 2, 3, 4]);

//Move from end to middle
assert.ok(ill.moveBefore(4, 2));
verify(ill, [5, 1, 4, 2, 3]);

//Move from middle to middle
assert.ok(ill.moveBefore(2, 1));
verify(ill, [5, 2, 1, 4, 3]);

//Move from front to middle
assert.ok(ill.moveBefore(5, 3));
verify(ill, [2, 1, 4, 5, 3]);

//Move from middle to front
assert.ok(ill.moveBefore(4, 2));
verify(ill, [4, 2, 1, 5, 3]);

//Swap 2 elements in the middle
assert.ok(ill.moveBefore(1, 2));
verify(ill, [4, 1, 2, 5, 3]);

//Swap 2 elements at the end
assert.ok(ill.moveBefore(3, 5));
verify(ill, [4, 1, 2, 3, 5]);

//Swap 2 elements at the beginning
assert.ok(ill.moveBefore(1, 4));
verify(ill, [1, 4, 2, 3, 5]);

//Back to order
assert.ok(ill.moveBefore(4, 5));
verify(ill, [1, 2, 3, 4, 5]);

//Move the "same" element
assert.ok(ill.moveBefore(3, 3));
assert.ok(ill.moveBefore(1, 1));
assert.ok(ill.moveBefore(5, 5));

//Elements in order already
assert.ok(ill.moveBefore(3, 4));
verify(ill, [1, 2, 3, 4, 5]);

//-- Test insert after --//
ill = getFive();

//Already exists
assert.ok(!ill.insertAfter(5, 5, 5));

//After/Before key doesn't exist
assert.ok(!ill.insertAfter(0, 0, 6));

//Insert after head
assert.ok(ill.insertAfter(1.5, 1.5, 1));
verify(ill, [1, 1.5, 2, 3, 4, 5]);

//Insert after in middle
assert.ok(ill.insertAfter(3.5, 3.5, 3));
verify(ill, [1, 1.5, 2, 3, 3.5, 4, 5]);

//Insert after tail
assert.ok(ill.insertAfter(5.5, 5.5, 5));
verify(ill, [1, 1.5, 2, 3, 3.5, 4, 5, 5.5]);

//-- Test insert before --//
ill = getFive();

//Already exists
assert.ok(!ill.insertBefore(5, 5, 5));

//After/Before key doesn't exist
assert.ok(!ill.insertBefore(0, 0, 6));

//Insert before head
assert.ok(ill.insertBefore(0.5, 0.5, 1));
verify(ill, [0.5, 1, 2, 3, 4, 5]);

//Insert before in middle
assert.ok(ill.insertBefore(2.5, 2.5, 3));
verify(ill, [0.5, 1, 2, 2.5, 3, 4, 5]);

//Insert before tail
assert.ok(ill.insertBefore(4.5, 4.5, 5));
verify(ill, [0.5, 1, 2, 2.5, 3, 4, 4.5, 5]);

function verify(ill, expected) {
    assert.ok(ill instanceof IndexedLinkedList,
	      "ill not instance of IndexedLinkedList");
    if (ill.getHead() != null) {
	assert.equal(ill.getHead().getPrevious(), null, 
		     "Head's previous wasn't null");
	assert.equal(ill.getHead().getValue(), expected[0], 
		     "Head wasn't set correctly");
    }
    else {
	assert.equal(ill.getSize(), 0);
	assert.ok(ill.empty());
    }

    if(ill.getTail() != null) {
	assert.equal(ill.getTail().getNext(), null, "Tail's (" + 
		     ill.getTail().getValue() + ") next wasn't null");
	assert.equal(ill.getTail().getValue(), expected[expected.length - 1],
		     "Tail (" + ill.getTail().getValue() + 
		     ") wasn't set correctly (" + 
		     expected[expected.length - 1] + ")");
    }
    else {
	assert.equal(ill.getSize(), 0);
	assert.ok(ill.empty());
    }

    //Walk the linked list and verify all the pointers are pointing at the
    // right places.
    var n = ill.getHead();
    var i = 0;
    while (n != null) {
	assert.equal(n.getValue(), expected[i], "Value (" + n.getValue() + 
		     ") isn't what's expected (" + expected[i] + ").");
	if (n.getPrevious() != null) {
	    assert.strictEqual(n.getPrevious().getNext(), n, 
			       "Previous isn't pointing to current");
	}
	if (n.getNext() != null) {
	    assert.strictEqual(n.getNext().getPrevious(), n, 
			       "Next isn't pointing to current");
	}
	++i;
	n = n.getNext();
    }
    assert.equal(i, ill.getSize(), "Number in list (" + i + 
		 ") didn't match map size(" + ill.getSize() + ").");
}

//Returns [1, 2, 3, 4, 5]
function getFive() {
    var ill = new IndexedLinkedList();
    for(i = 5; i > 0; --i) {
	assert.ok(ill.shift(i, i));
    }
    return ill;
}