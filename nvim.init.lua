-- This will allow denols instead of tsserver honestly it's seems better than ts server

local nvim_lsp = require("lspconfig")
nvim_lsp.denols.setup({})

nvim_lsp.tsserver.setup({
  -- Omitting some options
  root_dir = nvim_lsp.util.root_pattern("package.json"),
})
nvim_lsp.denols.setup({
  -- Omitting some options
  root_dir = nvim_lsp.util.root_pattern("deno.json"),
})
