const express = require('express');
const morgan = require('morgan');
const userRouter = require('./router/userRouter')
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// cors ช่วยให้ backend frontend ที่รันกันคนละ port สามารถเห็นกันได้ เหมาะกับ dev mode
const cors = require('cors');

// server & port
const app = express();
const defaultPort = 8080;
const port = process.env.PORT || defaultPort;

// middleware หรือ lid
app.use(express.json())
app.use(morgan('dev'))
app.use(cors());

app.use('/boardgame', userRouter);

app.listen(port, () => {
    console.log(`App is running on port ${port}`)
})