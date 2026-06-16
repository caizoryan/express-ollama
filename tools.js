import fs from "fs";

export const readFileTool = {
	type: 'function',
	function: {
		name: "read_file",
		description: "Read the contents of a file from the local filesystem.",
		parameters: {
			type: "object",
			properties: {
				file_path: { type: "string", description: "Path to the file to read." },
			},
			required: ["file_path"]
		}
	}
};

export function readFile({ file_path, encoding = "utf-8" }) {
  try {
    const content = fs.readFileSync(file_path, encoding);
    return {
      success: true,
      content
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

export const writeFileTool = {
	type: 'function',
	function: {
		name: "write_file",
		description: "Create a file with the provided content.",
		parameters: {
			type: "object",
			properties: {
				file_path: { type: "string", description: "Absolute or relative file path." },
				content: { type: "string", description: "Content to write into the file." },
			},
			required: ["file_path", "content"]
		}
	}
}

export function writeFile({ file_path, content, encoding = "utf-8" }) {
  try {
    fs.writeFileSync(file_path, content, encoding);
    return {
      success: true,
      bytesWritten: Buffer.byteLength(content, encoding)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

export const listFilesTool = {
	type: 'function',
	function: {
		name: "list_files",
		description: "List the contents of a directory from the local filesystem.",
		parameters: {
			type: "object",
			properties: {
				path: { type: "string", description: "Path to the directory to list." },
			},
			required: ["path"]
		}
	}
};

export function listFiles({ path }) {
  try {
    let files = fs.readdirSync(path, {withFileTypes: true});
		files = files.map(e => e.isDirectory() ? (e.name + '/') : e.name)
    return {
      success: true,
      files: files.join("\n")
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
