require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Madras Wall Stories API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
