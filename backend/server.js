const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
// const errorHandler = require('./middleware/error');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes (temporarily commented)
 app.use('/api/auth', require('./routes/auth'));
 app.use('/api/products', require('./routes/products'));
 app.use('/api/cart', require('./routes/cart'));
 app.use('/api/orders', require('./routes/orders'));

// Error handler
 //app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));