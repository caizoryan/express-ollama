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

