import { readFile, writeFile, listFiles, readFileTool, writeFileTool, listFilesTool } from './tools.js'
import { messages } from './message.js'

const REQUIRED_ARGS = {
  read_file: readFileTool.function.parameters.required,
  write_file: writeFileTool.function.parameters.required,
  list_files: listFilesTool.function.parameters.required,
}

const TOOL_FUNCTIONS = {
  read_file: (args) => {
    const output = readFile(args)
    return output.success ? output.content : output.error
  },

  write_file: (args) => {
    writeFile(args)
    return 'success'
  },

	list_files: (args) => {
		let output = listFiles(args)
		return output.success ? output.files : output.error
	}
}

export function callFunction(toolCall, part, loopAround) {
  const name = toolCall.function.name
	let args = toolCall.function.arguments
	if (typeof args == 'string') args = JSON.parse(args)

  console.log('Dawg wants to call: ', name, args)
	// messages.push(part.message)
	//  messages.push({
	// 	role: "tool",
	// 	content: ""+name+" with arguments: " + JSON.stringify(args)
	// })

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

  const result = TOOL_FUNCTIONS[name](args)

	// console.log(name, args, result)
  messages.push({
    role: 'tool',
    tool_name: name,
    content: result,
  })
}
