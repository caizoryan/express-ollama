import { add, sub, mul, div, sqrt } from './calculator.js'
import {describe, it} from 'node:test'
import assert from 'node:assert'

describe('Calculator', () => {
	describe('add', () => {
		it('should add two numbers', () => {
			assert.strictEqual(add(2, 3), 5)
		})
		it('should add negative numbers', () => {
			assert.strictEqual(add(-1, -1), -2)
		})
	})

	describe('sub', () => {
		it('should subtract two numbers', () => {
			assert.strictEqual(sub(5, 3), 2)
		})
		it('should subtract negative numbers', () => {
			assert.strictEqual(sub(1, -1), 2)
		})
	})

	describe('mul', () => {
		it('should multiply two numbers', () => {
			assert.strictEqual(mul(2, 3), 6)
		})
		it('should multiply negative numbers', () => {
			assert.strictEqual(mul(-2, 3), -6)
		})
		it('should multiply zero', () => {
			assert.strictEqual(mul(0, 5), 0)
		})
	})

	describe('div', () => {
		it('should divide two numbers', () => {
			assert.strictEqual(div(6, 3), 2)
		})
		it('should divide with decimal result', () => {
			assert.strictEqual(div(5, 2), 2.5)
		})
	})

	describe('sqrt', () => {
		it('should calculate square root of a perfect number', () => {
			assert.strictEqual(sqrt(4), 2)
		})
		it('should handle zero', () => {
			assert.strictEqual(sqrt(0), 0)
		})
		it('should throw error for negative numbers', () => {
		        assert.throws(() => sqrt(-1), undefined, "Square root of negative number is not defined in real numbers")
	    })
    })

})
