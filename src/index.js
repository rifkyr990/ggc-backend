require('dotenv').config();
const express = require('express'); 
const cors = require('cors');

const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const perumahanRoutes = require('./routes/perumahan');
const articlesRoutes = require('./routes/article');
const fasilitasRoutes = require('./routes/fasilitas');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/articles', articlesRoutes);
app.use('/perumahan', perumahanRoutes);
app.use('/fasilitas', fasilitasRoutes);

app.get('/', async (req, res) => {
    res.send('Hello from Express + TypeScript + Prisma!');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
