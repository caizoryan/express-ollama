import { readFileTool, writeFileTool, listFilesTool } from './tools.js'
import { messages } from './message.js'

const REQUIRED_ARGS = {
  read: readFileTool.parameters.required,
  write: writeFileTool.parameters.required,
  list: listFilesTool.parameters.required,
}

const TOOL_FUNCTIONS = {
  read: readFileTool.execute,
  write: writeFileTool.execute,
	list: listFilesTool.execute,
}

export function callFunction(toolCall, part, loopAround) {
  const name = toolCall.function.name
	let args = toolCall.function.arguments
	if (typeof args == 'string') args = JSON.parse(args)

  console.log('Dawg wants to call: ', name, args)
	messages.push({
		role: "assistant",
	...part.message
	})

  if (!TOOL_FUNCTIONS[name]) {
    console.log(`Unknown tool: ${name}`)
    return
  }

  // Validate required args
  const requiredArgs = REQUIRED_ARGS[name] ?? []
  for (const arg of requiredArgs) {
    if (!args[arg]) {
     messages.push({
       role: 'user',
        content: `You called ${name} without the argument: '${arg}'. Please re-do tool call with '${arg}' as the argument and continue with your task!.`
      })
			loopAround()
      return
    }
  }

  loopAround()

  let result = TOOL_FUNCTIONS[name](args)
	if (result.success) {
		result = result.content
		messages.push({
			role: 'tool',
			tool_name: name,
			content: result,
		})
	}

	else {
		messages.push({
			role: 'user',
			content: "There was an error: " + result.error,
		})
	}

}
