// backend/routes/products.js
const router = require('express').Router();
const productController = require('../controllers/productController');
const { protectAdmin } = require('../middleware/auth');

// Public
router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);

// Admin Only
router.post('/', protectAdmin, productController.createProduct);
router.put('/:id', protectAdmin, productController.updateProduct);
router.delete('/:id', protectAdmin, productController.deleteProduct);

module.exports = router;
