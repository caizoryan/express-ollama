-- should have a table here and then can have multiple buffers?
local buf

local function begin_llm()
	buf = vim.api.nvim_create_buf(true, true)
	vim.cmd("vsplit")
	vim.api.nvim_set_current_buf(buf)
end



local function double_buf()
  local lines = vim.api.nvim_buf_get_lines(buf, 0, -1, false)
  vim.api.nvim_buf_set_lines(buf, -1, -1, false, lines)
end

local function append_output(data)
  local last_line = vim.api.nvim_buf_get_lines(buf, -2, -1, false)[1] or ""
  -- Merge first chunk element onto the existing last line
  local merged = last_line .. data[1]
  vim.api.nvim_buf_set_lines(buf, -2, -1, false, { merged })
  -- Append the rest as new lines (skipping the last empty sentinel)
  if #data > 1 then
    vim.api.nvim_buf_set_lines(buf, -1, -1, false, vim.list_slice(data, 2))
  end
end

local function get_line_range(opts)
  local filepath = vim.api.nvim_buf_get_name(0)
  append_output({string.format(" /readfile:%s:%d-%d", filepath, opts.line1, opts.line2)})
end


local function run_node()
  local lines = vim.api.nvim_buf_get_lines(buf, 0, -1, false)
  local content = table.concat(lines, "\n")
  vim.fn.jobstart({ "node", "loop.js", content }, {
    on_stdout = function(_, data)
		 append_output(data)
      -- vim.api.nvim_buf_set_lines(buf, -1, -1, false, data)
    end,
    on_stderr = function(_, data)
		 append_output(data)
    end,
  })
end

vim.api.nvim_create_user_command("RunNode", run_node, {})
vim.api.nvim_create_user_command("DoubleBuf", double_buf, {})
vim.api.nvim_create_user_command("GetLineNumber", get_line_range, { range = true })
vim.api.nvim_create_user_command("BeginLlm", begin_llm, {})

