// import express from 'express'
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()
const compression = require('compression')
import express from 'express'
const bodyParser = require('body-parser')
const router = express.Router();
const cookieParser = require("cookie-parser");

const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(compression());
app.use(cookieParser());
app.use(express.json());

// Use CORS middleware
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

// A route declaration section
const { auth } = require('../api/auth/auth.routes');
// console.log(auth)
app.use('/auth', auth); // Apply authentication middleware to the /user route

// i want to make /user is not accessible without authentication


const { user } = require('../api/users/users.routes');
// console.log(user)
app.use('/user', user); // Apply authentication middleware to the /user route

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello World!' });
}
);


export { app };