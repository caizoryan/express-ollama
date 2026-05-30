const express = require('express');

const app = express();
const PORT = 3000;

app.get('/api', async (req, res) => {
  const response = await fetch('http://localhost:11434/api/ps');
	console.log("GOT", response)
	let res = response.json()
	console.log(res)
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
