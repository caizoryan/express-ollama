import { readFile, writeFile, readFileTool, writeFileTool } from './tools.js'

// # TODO
// rewrite this file so that all logic is retained.
//

export function callFunction(toolCall){
	console.log('Dawg wants to call: ', toolCall.function.name)
	if (toolCall.function.name == 'read_file'){
		loopAround = true
		if (!toolCall.function.arguments.file_path){
			messages.push({
				role: 'user',
				content: "Tool call failed because argument 'file_path' was not there. If you used a different parameter name, re-do tool call with 'file_path' as argument"
			})
			return
		}
		messages.push(part.message)
		console.log("wants to read file...", toolCall.function.arguments)
		let output = readFile(toolCall.function.arguments)
		console.log("read file", output)
		messages.push({
			role: 'tool',
			tool_name: 'read_file',
			content: output.success ? output.content : output.error,
		})
	}

	else if (toolCall.function.name == 'write_file'){
		loopAround = true

		if (!toolCall.function.arguments.file_path){
			messages.push({
				role: 'user',
				content: "Tool call failed because argument 'file_path' was not there. If you used a different parameter name, re-do tool call with 'file_path' as argument"
			})
			return
		}

		if (!toolCall.function.arguments.content){
			messages.push({
				role: 'user',
				content: "Tool call failed because argument 'content' was not there. If you used a different parameter name, re-do tool call with 'file_path' as argument"
			})
			return
		}

		messages.push(part.message)
		console.log("wants to write file...", toolCall.function.arguments)
		let output = writeFile(toolCall.function.arguments)
		messages.push({
			role: 'tool',
			tool_name: 'write_file',
			content: 'success'
		})
	}
}
