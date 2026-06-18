# Minimist.js File Chunks

## hasKey Function

```js
function hasKey(obj, keys) {
	var o = obj;
	keys.slice(0, -1).forEach(function (key) {
		o = o[key] || {};
	});

	var key = keys[keys.length - 1];
	return key in o;
}
```

### Description
The `hasKey` function checks if a nested key exists within an object. It traverses the object using the keys provided and returns `true` if the last key exists in the nested object, otherwise it returns `false`.

### Logic
1. Start with the initial object `obj`.
2. Iterate over all keys except the last one, updating the current object to the nested object at each key.
3. Check if the last key exists in the final nested object.

## isNumber Function

```js
function isNumber(x) {
	if (typeof x === 'number') { return true; }
	if ((/^0x[0-9a-f]+$/i).test(x)) { return true; }
	return (/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/).test(x);
}
```

### Description
The `isNumber` function checks if a given value is a number or can be parsed as a number. It handles various formats including hexadecimal, decimal, and scientific notation.

### Logic
1. Check if the value is already a number.
2. Check if the value is a hexadecimal number.
3. Check if the value matches a decimal or scientific notation number.

## isConstructorOrProto Function

```js
function isConstructorOrProto(obj, key) {
	return (key === 'constructor' && typeof obj[key] === 'function') || key === '__proto__';
}
```

### Description
The `isConstructorOrProto` function checks if a given key is either the constructor function or the `__proto__` property of an object.

### Logic
1. Check if the key is 'constructor' and the value is a function.
2. Check if the key is '__proto__'.

## Main Exported Function - Initialization

```js
module.exports = function (args, opts) {
	if (!opts) { opts = {}; }

	var flags = {
		bools: {},
		strings: {},
		unknownFn: null,
	};

	if (typeof opts.unknown === 'function') {
		flags.unknownFn = opts.unknown;
	}

	if (typeof opts.boolean === 'boolean' && opts.boolean) {
		flags.allBools = true;
	} else {
		[].concat(opts.boolean).filter(Boolean).forEach(function (key) {
			flags.bools[key] = true;
		});
	}
```

### Description
The main exported function initializes the parsing process. It sets up the initial state for parsing command-line arguments, including handling boolean flags and unknown functions.

### Logic
1. Initialize `opts` if not provided.
2. Set up the `flags` object to keep track of boolean flags, string flags, and unknown functions.
3. Set the unknown function if provided in `opts`.
4. Handle boolean flags, setting `allBools` if specified, otherwise process individual boolean flags.

## Alias Handling

```js
Object.keys(opts.alias || {}).forEach(function (key) {
	aliases[key] = [].concat(opts.alias[key]);
	aliases[key].forEach(function (x) {
		aliases[x] = [key].concat(aliases[key].filter(function (y) {
			return x !== y;
		}));
	});
});
```

### Description
This section handles aliases for command-line arguments. It sets up a mapping of aliases to their primary keys and vice versa.

### Logic
1. Iterate over each key in the `alias` object.
2. For each alias, create a bidirectional mapping between the primary key and its aliases.

## String Flag Handling

```js
[].concat(opts.string).filter(Boolean).forEach(function (key) {
	flags.strings[key] = true;
	if (aliases[key]) {
		[].concat(aliases[key]).forEach(function (k) {
			flags.strings[k] = true;
		});
	}
});
```

### Description
This section handles string flags, marking them and their aliases in the `flags` object.

### Logic
1. Iterate over each string flag.
2. Mark the flag and its aliases as strings in the `flags` object.

## Defaults Handling

```js
var defaults = opts.default || {};

var argv = { _: [] };

function argDefined(key, arg) {
	return (flags.allBools && (/^--[^=]+$/).test(arg))
		|| flags.strings[key]
		|| flags.bools[key]
		|| aliases[key];
}
```

### Description
This section handles default values and initializes the `argv` object. It also defines the `argDefined` function to check if an argument is defined.

### Logic
1. Initialize `defaults` with the provided default values or an empty object.
2. Initialize the `argv` object with an empty array for positional arguments.
3. Define the `argDefined` function to check if an argument is defined based on boolean flags, string flags, or aliases.

## setKey Function

```js
function setKey(obj, keys, value) {
	var o = obj;
	for (var i = 0; i < keys.length - 1; i++) {
		var key = keys[i];
		if (isConstructorOrProto(o, key)) { return; }
		if (o[key] === undefined) { o[key] = {}; }
		if (
			o[key] === Object.prototype
			|| o[key] === Number.prototype
			|| o[key] === String.prototype
		) {
			o[key] = {};
		}
		if (o[key] === Array.prototype) { o[key] = []; }
		o = o[key];
	}

	var lastKey = keys[keys.length - 1];
	if (isConstructorOrProto(o, lastKey)) { return; }
	if (
		o === Object.prototype
		|| o === Number.prototype
		|| o === String.prototype
	) {
		o = {};
	}
	if (o === Array.prototype) { o = []; }
	if (o[lastKey] === undefined || isBooleanKey(lastKey) || typeof o[lastKey] === 'boolean') {
		o[lastKey] = value;
	} else if (Array.isArray(o[lastKey])) {
		o[lastKey].push(value);
	} else {
		o[lastKey] = [o[lastKey], value];
	}
}
```

### Description
The `setKey` function sets a value in a nested object using a dot-separated key path. It handles various edge cases and ensures the nested structure is created if it doesn't exist.

### Logic
1. Traverse the object to the parent of the target key.
2. Create nested objects or arrays as needed.
3. Set the value at the target key, handling arrays and booleans appropriately.

## setArg Function

```js
function setArg(key, val, arg) {
	if (arg && flags.unknownFn && !argDefined(key, arg)) {
		if (flags.unknownFn(arg) === false) { return; }
	}

	var value = !flags.strings[key] && isNumber(val)
		? Number(val)
		: val;
	setKey(argv, key.split('.'), value);

	(aliases[key] || []).forEach(function (x) {
		setKey(argv, x.split('.'), value);
	});
}
```

### Description
The `setArg` function sets an argument in the `argv` object. It handles unknown arguments and converts numeric values if the argument is not a string.

### Logic
1. Check if the argument is unknown and handle it if necessary.
2. Convert the value to a number if it's not a string and is numeric.
3. Set the value in the `argv` object using `setKey`.
4. Set the value for all aliases of the key.

## Boolean Key Check

```js
function isBooleanKey(key) {
	if (flags.bools[key]) {
		return true;
	}
	if (!aliases[key]) {
		return false;
	}
	return aliases[key].some(function (x) {
		return flags.bools[x];
	});
}
```

### Description
The `isBooleanKey` function checks if a key is a boolean flag, either directly or through an alias.

### Logic
1. Check if the key is a boolean flag.
2. Check if any of the aliases of the key are boolean flags.

## Setting Default Booleans

```js
// Set booleans to false by default.
Object.keys(flags.bools).forEach(function (key) {
	setArg(key, false);
});
// Set booleans to user defined default if supplied.
Object.keys(defaults).filter(isBooleanKey).forEach(function (key) {
	setArg(key, defaults[key]);
});
```

### Description
This section sets boolean flags to `false` by default and applies user-defined defaults if provided.

### Logic
1. Set all boolean flags to `false` by default.
2. Apply user-defined defaults for boolean flags if they are provided.

## Handling `--` Separator

```js
var notFlags = [];

if (args.indexOf('--') !== -1) {
	notFlags = args.slice(args.indexOf('--') + 1);
	args = args.slice(0, args.indexOf('--'));
}
```

### Description
This section handles the `--` separator in the arguments, splitting the arguments into flags and non-flag arguments.

### Logic
1. Check if the `--` separator is present in the arguments.
2. Split the arguments into flags and non-flag arguments if the separator is found.

## Parsing Arguments

## Parsing Arguments with `--key=value` Format

```js
if ((/^--.+=/).test(arg)) {
	// Using [\s\S] instead of . because js doesn't support the
	// 'dotall' regex modifier. See:
	// http://stackoverflow.com/a/1068308/13216
	var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
	key = m[1];
	var value = m[2];
	if (isBooleanKey(key)) {
		value = value !== 'false';
	}
	setArg(key, value, arg);
}
```

### Description
This section handles arguments in the format `--key=value`. It extracts the key and value, and sets the argument in the `argv` object.

### Logic
1. Check if the argument matches the `--key=value` format.
2. Extract the key and value from the argument.
3. If the key is a boolean flag, convert the value to a boolean.
4. Set the argument using `setArg`.

## Parsing Arguments with `--no-key` Format

```js
else if ((/^--no-.+/).test(arg)) {
	key = arg.match(/^--no-(.+)/)[1];
	setArg(key, false, arg);
}
```

### Description
This section handles arguments in the format `--no-key`, which sets a boolean flag to `false`.

### Logic
1. Check if the argument matches the `--no-key` format.
2. Extract the key from the argument.
3. Set the argument to `false` using `setArg`.

## Parsing Arguments with `--key` Format

```js
else if ((/^--.+/).test(arg)) {
	key = arg.match(/^--(.+)/)[1];
	next = args[i + 1];
	if (
		next !== undefined
		&& !(/^(-|--)[^-]/).test(next)
		&& !isBooleanKey(key)
		&& !flags.allBools
	) {
		setArg(key, next, arg);
		i += 1;
	} else if ((/^(true|false)$/).test(next)) {
		setArg(key, next === 'true', arg);
		i += 1;
	} else {
		setArg(key, flags.strings[key] ? '' : true, arg);
	}
}
```

### Description
This section handles arguments in the format `--key`. It processes the next argument if it's not a flag or boolean, otherwise sets the argument to `true` or an empty string based on the flag type.

### Logic
1. Check if the argument matches the `--key` format.
2. Extract the key from the argument.
3. If the next argument is not a flag or boolean, set the argument to the next value.
4. If the next argument is `true` or `false`, set the argument to the corresponding boolean value.
5. Otherwise, set the argument to `true` or an empty string based on the flag type.

# Parsing Short Flags with Values

## Pattern Matching and Letter Splitting

### Description
This section identifies short flags (single dash followed by one or more characters) and prepares them for processing by extracting individual letters.

### Logic
1. Tests if the argument matches the pattern of a short flag (starts with `-` but not `--`)
2. Slices the argument to exclude the leading `-` and trailing character, then splits into individual letters
3. Initializes a `broken` flag to track when value extraction should stop

```js
else if ((/^-[^-]+/).test(arg)) {
	var letters = arg.slice(1, -1).split('');

	var broken = false;
```

## Handling Hyphen as Value

### Description
This check handles the special case where the value is explicitly a hyphen character, which is a valid value in command-line arguments.

### Logic
1. Extracts the next portion of the argument starting from the current letter position + 2
2. If the next portion is exactly `-`, sets the current letter's argument value to `-`
3. Continues to the next letter without breaking the loop

```js
	for (var j = 0; j < letters.length; j++) {
		next = arg.slice(j + 2);

		if (next === '-') {
			setArg(letters[j], next, arg);
			continue;
		}
```

## Handling Equals Sign with Value

### Description
This section processes flags that use the equals syntax (e.g., `-x=value`) to assign explicit values to flags.

### Logic
1. Checks if the current letter is alphabetic and the next character is `=`
2. Extracts everything after the `=` sign as the value
3. Sets the argument and breaks the loop since the value has been consumed

```js
		if ((/[A-Za-z]/).test(letters[j]) && next[0] === '=') {
			setArg(letters[j], next.slice(1), arg);
			broken = true;
			break;
		}
```

## Handling Numeric Values

### Description
This section detects and assigns numeric values to flags, supporting integers, decimals, and scientific notation.

### Logic
1. Verifies the current letter is alphabetic
2. Tests if the remaining portion matches a numeric pattern (including negative numbers, decimals, and exponential notation)
3. Assigns the numeric value and breaks the loop as the value is consumed

```js
		if (
			(/[A-Za-z]/).test(letters[j])
			&& (/-?\d+(\.\d*)?(e-?\d+)?$/).test(next)
		) {
			setArg(letters[j], next, arg);
			broken = true;
			break;
		}
```

## Handling Word Values or Default

### Description
This final section handles two cases: either assigning a word value when a non-word character follows, or setting a default boolean/empty value.

### Logic
1. Checks if there's a next letter that is a non-word character (indicating the start of a value)
2. If true, extracts and assigns everything from that point as the value, then breaks
3. Otherwise, assigns `true` or an empty string based on whether the flag is configured as a string type

```js
		if (letters[j + 1] && letters[j + 1].match(/\W/)) {
			setArg(letters[j], arg.slice(j + 2), arg);
			broken = true;
			break;
		} else {
			setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
		}
	}
}
```


## Parsing Positional Arguments

```js
else {
	if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
		argv._.push(flags.strings._ || !isNumber(arg) ? arg : Number(arg));
	}
	if (opts.stopEarly) {
		argv._.push.apply(argv._, args.slice(i + 1));
		break;
	}
}
```

### Description
This section handles positional arguments that are not flags. It pushes them into the `argv._` array, converting them to numbers if they are numeric.

### Logic
1. Check if the argument is not a flag.
2. Push the argument into the `argv._` array, converting it to a number if it's numeric.
3. If `opts.stopEarly` is set, push the remaining arguments into the `argv._` array and break the loop.

## Applying Defaults

```js
Object.keys(defaults).forEach(function (k) {
	if (!hasKey(argv, k.split('.'))) {
		setKey(argv, k.split('.'), defaults[k]);

		(aliases[k] || []).forEach(function (x) {
			setKey(argv, x.split('.'), defaults[k]);
		});
	}
});
```

### Description
This section applies default values to the `argv` object if they haven't been set by the arguments.

### Logic
1. Iterate over each default value.
2. If the key hasn't been set in `argv`, set it to the default value.
3. Set the default value for all aliases of the key.

## Handling `--` Non-Flag Arguments

```js
if (opts['--']) {
	argv['--'] = notFlags.slice();
} else {
	notFlags.forEach(function (k) {
		argv._.push(k);
	});
}
```

### Description
This section handles non-flag arguments that come after the `--` separator, either storing them in `argv['--']` or pushing them into the positional arguments array.

### Logic
1. If `opts['--']` is set, store the non-flag arguments in `argv['--']`.
2. Otherwise, push the non-flag arguments into the `argv._` array.

## Returning the Parsed Arguments

```js
return argv;
```

### Description
The main exported function returns the parsed arguments object.

### Logic
1. Return the `argv` object containing all parsed arguments.


