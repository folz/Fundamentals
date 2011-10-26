var HashMap = (function ()
{
	function HashMap(/* array_size=16, load=.25 */)
	{
		// Determine the size of the underlying array.
		var array_size = arguments[0] || 16;
		
		/** The number of items in the HashMap **/
		this.length = 0;
		/** The least percentage of free space we can have before we
		 * resize the array **/
		this.__loadn = arguments[1] || .25
		/** The underlying array for the HashMap **/
		this.__map = new Array(array_size);
		/** If we have fewer than this many free slots, we need a bigger array **/
		this.__load = Math.floor(array_size * this.__loadn);
		/** Keep track of how many times there has been a collision for hashes **/
		this.__collisions = new Array(array_size);
	}
	
	/***
	 * The hash function. Takes a string, turns it into a number.
	 * */
	HashMap.prototype.__hash = function(str /*, modulo=this.__map.length */)
	{
		var hash = 0;
		var modulo = arguments[1] || this.__map.length;
		
		var str = ""+str;
		for (i = 0, l = str.length; i < l; i++)
		{
			hash = ((hash<<5)-hash)+str.charCodeAt(i);
			hash = hash & hash;
		}
		
		return Math.abs(hash) % modulo;
	}
	
	/***
	 * Add a kvp to an array and keep track of collisions.
	 * */
	HashMap.prototype.__add_to = function(key, value, array, collisions)
	{
		
		var hash = this.__hash(key, array.length);
		var orig_hash = hash;
		collisions[hash] = collisions[hash] + 1 || 1;
		
		// Linear probing. If there's already something at our hash,
		// increase the hash by one and try to put it there. Repeat.
		while (array[hash] !== undefined)
		{
			// Increase the number of collisions for this hash.
			collisions[orig_hash]++;
			
			// If the key already exists in the array, break out of the
			// loop and overwrite the value to which the key points.
			if (array[hash][0] === key)
			{
				break;
			}
			hash = (hash + 1) % array.length;
		}
		array[hash] = [key, value];
		
		return [key, value];
	}
	
	/***
	 * Add a kvp to our HashMap, rebuilding the underlying array if necessary
	 * */
	HashMap.prototype.add = function(key, value)
	{
		// Add the kvp to the hashmap.
		this.__add_to(key, value, this.__map, this.__collisions);
		
		// Increase the number of items stored in the hashmap by one.
		this.length++;
		
		// If we're too low on free space, double the size of the array.
		if ((this.__map.length - this.length) <= this.__load)
		{
			// Find the next greatest power of two
			var v = this.__map.length;
			v |= v >> 1;
			v |= v >> 2;
			v |= v >> 4;
			v |= v >> 8;
			v |= v >> 16;
			v++;
			
			// Create new arrays with size next-greatest-power-of-two.
			var array = new Array(v);
			var collisions = new Array(v);
			
			// Regenerate the hash and collisions for each kvp in the old array
			for (var i = 0; i < this.__map.length; i++)
			{
				curr_pos = this.__map[i];
				
				if (curr_pos)
				{
					this.__add_to(curr_pos[0], curr_pos[1], array, collisions);
				}
			}
			
			// Set the map and collisions to the newly generated arrays
			this.__map = array;
			this.__collisions = collisions;
			
			// Reset the load
			this.__load = this.__loadn * array.length;
		}
		
		return true;
	}
	
	/***
	 * Lots of operations involve finding a certain kvp and doing
	 * something to it. This is a generic do-something method.
	 * */
	HashMap.prototype.__operation = function(operation, key /*, value */)
	{
		var hash = this.__hash(key);
		var orig_hash = hash;
		var collisions = this.__collisions[hash] || 0;
		
		for (var i = 0; i < collisions; i++)
		{
			if ((this.__map[hash]) && (this.__map[hash][0] === key))
			{
				switch (operation)
				{
					case "get":
						return this.__map[hash][1];
						break;
					case "remove":
						delete this.__map[hash];
						break;
					case "set":
						this.__map[hash] = [key, arguments[2]];
						return [key, arguments[2]];
						break;
					case "contains":
						// We can just return true here since we know
						// the item exists in the hashmap.
						return true;
						break;
					case "default":
						break;
				}
			}
			hash = (hash + 1) % this.__map.length;
		}
		
		return undefined;
	}
	
	HashMap.prototype.get = function(key, value)
	{
		return this.__operation("get", key);
	}
	
	HashMap.prototype.set = function(key, value)
	{
		return this.__operation("set", key, value);
	}
	
	HashMap.prototype.contains = function(key)
	{
		return !!this.__operation("contains", key);
	}
	
	HashMap.prototype.remove = function(key)
	{
		return this.__operation("remove", key);
	}
	
	return HashMap;
})();

// Call this file with --test to run test cases
(function(run_tests)
{
	if (run_tests)
	{
		var assert = require('assert');
		
		var h = new HashMap();
		
		var largenumber = Math.pow(2, 16);
		var halfoflarge = largenumber / 2
		
		console.log("Testing add(), get(), and contains()");
		for (var i = 0; i < largenumber; i++)
		{
			var key = "te"+i+"st"+i, value = "value"+i;
			h.add(key, value);
			assert.strictEqual(h.get(key), value);
			assert.strictEqual(h.contains(key), true);
		}
		
		console.log("Testing remove(), get() for undefined, and contains()");
		for (var i = 0; i < halfoflarge; i++)
		{
			var key = "te"+i+"st"+i, value = "value"+i;
			h.remove(key);
			assert.strictEqual(h.get(key), undefined);
			assert.strictEqual(h.contains(key), false);
		}
		
		console.log("Testing set() and get() for newly set keys");
		for (var i = halfoflarge; i < largenumber; i++)
		{
			var key = "te"+i+"st"+i, value = "newvalue"+i;
			h.set(key, value);
			assert.strictEqual(h.get(key), value);
		}
		
		console.log("Testing add(), get() for overwriting values");
		for (var i = 0; i < largenumber; i++)
		{
			var key = "newte"+i+"st"+i, value = "value"+i;
			h.add(key, value);
			assert.strictEqual(h.get(key), value);
			assert.strictEqual(h.contains(key), true);
		}
		
		console.log("All tests passed!");
	}
})(process.argv[2] === "--test");
