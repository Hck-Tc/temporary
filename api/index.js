import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import cors from 'cors';
import path from 'path';
dotenv.config();

mongoose.connect(process.env.MONGO).then(() => {
    console.log('Connected to MongoDB!');
    }).catch((err) => {
        console.log(err);
    });

const __dirname = path.resolve();

const app = express();

app.use(express.json());

app.use(cors({ origin: '*' }));

// Use CORS middleware to allow cross-origin requests
app.use(cors({
    origin: '*', // Replace with your domain or use '*' for all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
}));

app.listen(3000, () => {
    console.log('Server is running on port 3000!');
    }
);

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);

app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});
