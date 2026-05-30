const express = require('express');

const app = express();
const PORT = 3000;

app.get('/api', async (req, res) => {
  let response = await fetch('http://127.0.0.1:11434/api/tags');
	console.log("GOT", response)
	response = await response.json()
	console.log(response)
	res.send({data: response})
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
