const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const { body, validationResult } = require('express-validator');

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('items.product', 'name category price unit')
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sale by ID
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('items.product', 'name category price unit');
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new sale
router.post('/', [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMethod').isIn(['Cash', 'Card', 'Digital Payment']).withMessage('Invalid payment method')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { items, ...saleData } = req.body;
    
    // Validate products and calculate prices
    const saleItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.product} not found` });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      
      saleItems.push({
        product: item.product,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: product.price * item.quantity
      });
    }

    const sale = new Sale({
      ...saleData,
      items: saleItems
    });

    const savedSale = await sale.save();

    // Update inventory
    for (const item of saleItems) {
      const product = await Product.findById(item.product);
      const previousStock = product.stockQuantity;
      const newStock = previousStock - item.quantity;
      
      await Product.findByIdAndUpdate(item.product, { stockQuantity: newStock });
      
      // Create inventory record
      await new Inventory({
        product: item.product,
        type: 'Out',
        quantity: item.quantity,
        previousStock,
        newStock,
        reason: 'Sale',
        reference: savedSale._id.toString(),
        performedBy: saleData.customerName || 'System'
      }).save();
    }

    const populatedSale = await Sale.findById(savedSale._id)
      .populate('items.product', 'name category price unit');
    
    res.status(201).json(populatedSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get sales statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySales = await Sale.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const totalSales = await Sale.countDocuments();
    const totalRevenue = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const stats = {
      todaySales: todaySales.length,
      todayRevenue: todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      totalSales,
      totalRevenue: totalRevenue[0]?.total || 0
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sales by date range
router.get('/stats/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const sales = await Sale.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate('items.product', 'name category');

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalItems = sales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    res.json({
      sales,
      totalRevenue,
      totalItems,
      totalSales: sales.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 