const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const { spawn } = require('child_process');

const authenticateToken = require('./middleware/authMiddleware');

require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());



const uri = process.env.MONGODB_URI;

async function connectToDB() {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
}
connectToDB();


const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model('User', userSchema);


app.post('/api/login', async (req, res) => {
  console.log('new request');
  let { email, password } = req.body;
  console.log('email', email);
  try {
    const user = await User.findOne({ email });

    console.log('user', user);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  
    const isValidPassword = password === user.password;

    console.log('isValidPassword', isValidPassword);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

  
    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })
    console.log('token', token);

    // Successful login
    return res.json({ token });

  } catch (error) {
    console.log('error', error);
    console.error(error);
    res.status(500).json({ message: 'Server error'});
  }
});


app.get('/api/customer-data', authenticateToken, async (req, res) => {
  console.log('new request');
  const { email } = req.query;
  

  try {
    const response = await axios.get('https://api.gumroad.com/v2/sales', {
      params: {
        email,
        access_token: process.env.access_token,
      },
    });
    console.log('Response', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch customer data.', error);
    res.status(500).json({ error: 'Failed to fetch customer data.' });
  }
});

app.post('/api/execute-python-script', authenticateToken, (req, res) => {
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
  console.log('Server is running');
});

















