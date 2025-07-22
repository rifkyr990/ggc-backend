require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const perumahanRoutes = require('./routes/perumahan');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/perumahan', perumahanRoutes);

app.get('/', async (req, res) => {
    res.send('Hello from Express + TypeScript + Prisma!');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
