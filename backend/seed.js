const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const products = [
  { title: 'Product 1', description: 'Description 1', price: 19.99, category: 'Electronics', image: 'https://via.placeholder.com/150', stock: 10 },
  { title: 'Product 2', description: 'Description 2', price: 29.99, category: 'Books', image: 'https://via.placeholder.com/150', stock: 5 },
  // add more...
];

const seedDB = async () => {
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log('Database seeded');
  process.exit();
};

seedDB();