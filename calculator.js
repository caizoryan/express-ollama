export function add(num1, num2) {
	return num1 + num2
}

export function sub(num1, num2) {
	return num1 - num2
}

export function mul(num1, num2) {
	return num1 * num2
}

export function div(num1, num2) {
	if (num2 === 0) {
		throw new Error("Division by zero is not allowed")
	}
	return num1 / num2
}

export function sqrt(number) {
    if (number < 0) {
        throw new Error("Square root of negative number is not defined in real numbers")
    }
	if (number === 0) {
		return 0
	}	
	return Math.sqrt(number)
}
