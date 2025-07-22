const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const { body, validationResult } = require('express-validator');

// Get all inventory movements
router.get('/', async (req, res) => {
  try {
    const movements = await Inventory.find()
      .populate('product', 'name category')
      .sort({ createdAt: -1 });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get inventory movements by product
router.get('/product/:productId', async (req, res) => {
  try {
    const movements = await Inventory.find({ product: req.params.productId })
      .populate('product', 'name category')
      .sort({ createdAt: -1 });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add stock (In)
router.post('/add-stock', [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('performedBy').notEmpty().withMessage('Performed by is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productId, quantity, reason, reference, notes, performedBy } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const previousStock = product.stockQuantity;
    const newStock = previousStock + quantity;

    // Update product stock
    await Product.findByIdAndUpdate(productId, { stockQuantity: newStock });

    // Create inventory record
    const inventory = new Inventory({
      product: productId,
      type: 'In',
      quantity,
      previousStock,
      newStock,
      reason,
      reference,
      notes,
      performedBy
    });

    const savedInventory = await inventory.save();
    const populatedInventory = await Inventory.findById(savedInventory._id)
      .populate('product', 'name category');

    res.status(201).json(populatedInventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Adjust stock
router.post('/adjust-stock', [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt().withMessage('Quantity must be an integer'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('performedBy').notEmpty().withMessage('Performed by is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productId, quantity, reason, reference, notes, performedBy } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const previousStock = product.stockQuantity;
    const newStock = previousStock + quantity;

    if (newStock < 0) {
      return res.status(400).json({ message: 'Insufficient stock for adjustment' });
    }

    // Update product stock
    await Product.findByIdAndUpdate(productId, { stockQuantity: newStock });

    // Create inventory record
    const inventory = new Inventory({
      product: productId,
      type: 'Adjustment',
      quantity,
      previousStock,
      newStock,
      reason,
      reference,
      notes,
      performedBy
    });

    const savedInventory = await inventory.save();
    const populatedInventory = await Inventory.findById(savedInventory._id)
      .populate('product', 'name category');

    res.status(201).json(populatedInventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Record expiry/damage
router.post('/record-loss', [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('type').isIn(['Expiry', 'Damage']).withMessage('Type must be Expiry or Damage'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('performedBy').notEmpty().withMessage('Performed by is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productId, quantity, type, reason, reference, notes, performedBy } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock for loss recording' });
    }

    const previousStock = product.stockQuantity;
    const newStock = previousStock - quantity;

    // Update product stock
    await Product.findByIdAndUpdate(productId, { stockQuantity: newStock });

    // Create inventory record
    const inventory = new Inventory({
      product: productId,
      type,
      quantity,
      previousStock,
      newStock,
      reason,
      reference,
      notes,
      performedBy
    });

    const savedInventory = await inventory.save();
    const populatedInventory = await Inventory.findById(savedInventory._id)
      .populate('product', 'name category');

    res.status(201).json(populatedInventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get inventory summary
router.get('/summary', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$stockQuantity', '$minStockLevel'] }
    });
    
    const totalStockValue = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$stockQuantity', '$price'] } } } }
    ]);

    const recentMovements = await Inventory.find()
      .populate('product', 'name category')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalProducts,
      lowStockProducts,
      totalStockValue: totalStockValue[0]?.total || 0,
      recentMovements
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 