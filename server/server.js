const express = require('express');
const morgan = require('morgan');
const userRouter = require('./router/userRouter')
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// server & port
const app = express();
const defaultPort = 8080;
const port = process.env.PORT || defaultPort;

// middleware หรือ lid
app.use(express.json())
app.use(morgan('dev'))

app.use('/boardgame', userRouter);

app.listen(port, () => {
    console.log(`App is running on port ${port}`)
})