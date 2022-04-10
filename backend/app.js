require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.use('/api', require('./routes/userRoute'));

app.get('/api', (req, res) => {
  res.send('Hello :)');
});

module.exports = app;
