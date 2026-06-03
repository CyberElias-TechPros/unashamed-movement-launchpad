try {
  require('./controllers/authController.js');
  require('./controllers/orderController.js');
  require('./controllers/productController.js');
  console.log('controllers loaded successfully');
} catch (e) {
  console.error('syntax error loading controllers:', e);
  process.exit(1);
}
