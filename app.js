const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/api/customer-data', async (req, res) => {
  console.log('new request');
  const { email } = req.body;

  try {
    const response = await axios.get('https://api.gumroad.com/v2/sales', {
      params: {
        email,
        access_token: process.env.access_token,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch customer data.', error);
    res.status(500).json({ error: 'Failed to fetch customer data.' });
  }
});

app.post('/api/execute-python-script', (req, res) => {
  console.log('new request');
  const { selectedProductID, licenseKey } = req.body;

  const pythonProcess = spawn('python3', [
    './script/script.py',
    selectedProductID,
    licenseKey,
  ]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {

    console.log(`child process exited with code ${code}`);
    if (code === 0) {
      res.sendStatus(200);
    } 
    else if (code === 2) {
      res.status(404).send('Invalid license key or product id');
    }
    else {
      res.status(500).send('An error occurred while executing the Python script.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port 'http://localhost:${PORT}'`);
});