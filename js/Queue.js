#!/usr/bin/env node

/***
 * A Queue that contains at most maxsize elements.
 * 
 * Elements are stored in an array with pointers to the start and
 * end of the BoundedQueue. All functions are O(1).
 * 
 * Compared to using a singly-linked list with a pointer to the last
 * array to store the underlying data, this implementation is more
 * memory-efficient when there are at least `maxsize`/2 elements in the
 * Queue (because the amount of memory it takes to store a pointer to
 * another singly-linked list node is equal to the amount of memory it
 * takes to actually store an integer). So if you know in advance about
 * how many elements you'll need to store, using an array is more
 * efficient.
 ***/
var BoundedQueue = (function(undefined)
{
	function BoundedQueue(maxsize)
	{
		if (typeof maxsize !== 'number' || maxsize < 0)
		{
			throw new Error("maxsize must be a positive number");
		}
		/** The maximum number of elements the BoundedQueue should hold **/
		this.__maxsize = maxsize;
		
		/** The current number of elements in the BoundedQueue **/
		this.length = 0;
		
		/** Pointers to the start and end of the BoundedQueue **/
		this.__head = this.__tail = 0;
		/** The underlying array for the BoundedQueue **/
		this.__queue = new Array(this.__maxsize);
	}
	
	/***
	 * Resets the BoundedQueue to be completely empty
	 ***/
	BoundedQueue.prototype.clear = function()
	{
		this.length = 0;
		this.__head = this.__tail = 0;
		this.__queue = new Array(this.__maxsize);
	}
	
	/***
	 * Adds `val` to the __tail of the BoundedQueue.
	 * 
	 * If there's no space left, does nothing and returns false.
	 ***/
	BoundedQueue.prototype.enqueue = function(val)
	{
		// If there's still space, just add `val` at the __tail.
		if (this.length < this.__maxsize)
		{
			this.__queue[this.__tail] = val;
			this.__tail = (this.__tail + 1) % this.__maxsize;
			this.length++;
			
			return true;
		}
		// Otherwise, return false.
		else
		{
			return false;
		}
	}
	
	/***
	 * Removes and returns the __head of the BoundedQueue, or undefined
	 * if the BoundedQueue is empty.
	 ***/
	BoundedQueue.prototype.dequeue = function()
	{
		if (this.length)
		{
			var ret = this.__queue[this.__head];
			
			delete this.__queue[this.__head];
			this.__head = (this.__head + 1) % this.__maxsize;
			this.length--;
			
			return ret;
		}
		else
		{
			return undefined;
		}
	}
	
	/***
	 * Returns the next-in-line element of the BoundedQueue without removing it
	 * from the BoundedQueue.
	 * 
	 * If the BoundedQueue is empty, returns undefined.
	 ***/
	BoundedQueue.prototype.peek = function()
	{
		if (this.length)
		{
			return this.__queue[this.__head];
		}
		else
		{
			return undefined;
		}
	}
	
	return BoundedQueue;
})();

// Call this file with --test to run test cases
// In case you're wondering about (some_number)|0, that's just shorthand
// for Math.floor(some_number)
(function(run_tests)
{
	if (run_tests)
	{
		var assert = require('assert');
		console.log("Running tests");
		
		var QUEUE_SIZE = 16
		
		var b = new BoundedQueue(QUEUE_SIZE);
		var head_expect = tail_expect = 0;
		
		console.log("Testing enqueueing/dequeueing without going over size limit.");
		assert.strictEqual(b.enqueue(0), true);
		for (var i = 1; i < QUEUE_SIZE; i++)
		{
			assert.strictEqual(b.dequeue(), (i-1 / 2)|0);
			assert.strictEqual(b.enqueue(i), true);
			assert.strictEqual(b.peek(), i);
		}
		b.clear();
		
		console.log("Testing dequeueing to an empty BoundedQueue.");
		for (var i = 0; i < QUEUE_SIZE; i+=2)
		{
			var last = b.peek();
			assert.strictEqual(b.dequeue(), last);
			assert.strictEqual(b.dequeue(), undefined);
			b.enqueue("n"+i);
			assert.strictEqual(b.peek(), "n"+i);
		}
		b.clear();
		
		console.log("Testing enqueueing to over capacity.");
		for (var i = 0; i < QUEUE_SIZE * 2; i++)
		{
			if (i < QUEUE_SIZE)
			{
				assert.strictEqual(b.enqueue(i), true);
			}
			else
			{
				assert.strictEqual(b.enqueue(i), false);
			}
		}
		b.clear();
		
		console.log("Testing head and tail positions fall where they should.");
		for (var i = 0; i < QUEUE_SIZE * 2; i++)
		{
			b.enqueue(i);
			if (i % 3 == 0)
			{
				assert.strictEqual(b.dequeue(), (i / 3)|0);
			}
		}
		
		console.log("All tests passed!");
	}
})(process.argv[2] === "--test");
