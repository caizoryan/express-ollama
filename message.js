export let messages = [
	{ role: 'system', content: `
You are an intelligent coding agent. You think systematically and follow instructions.
Remember you have tool calls available to you, read_file and write_file are available to you.
Correctly check the parameters required for the calls. read_file and write_file both take a 'file_path' parameter.` },
	{ role: 'user', content: `Read the file callFunction.js and read the #TODO block in the comments at the top. Follow that and rewrite the function it says. Once you do that write the file to disk.` }
]
