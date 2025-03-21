require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoute = require('./Routes/userRoute');
const canvasRoute = require('./Routes/canvasRoute');
const connectToDatabase = require('./db');

connectToDatabase();
const app = express();
const PORT = process.env.PORT || 3030;
app.use(cors());
app.use(express.json());

app.use('/users', userRoute);
app.use('/canvas', canvasRoute);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
