# 🥛 Dairy Product Inventory and Sales Management System

A comprehensive MERN stack application for managing dairy product inventory, sales, and reporting.

## Features

- **Product Management**: Add, edit, and manage dairy products with categories
- **Inventory Tracking**: Real-time stock monitoring with low stock alerts
- **Sales Management**: Create sales transactions with multiple items
- **Inventory Movements**: Track stock additions, adjustments, and losses
- **Reporting**: Generate sales, inventory, and product reports
- **Dashboard**: Real-time statistics and overview
- **Responsive Design**: Modern UI that works on all devices

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React.js, React Router, Axios
- **UI**: Custom CSS with modern design
- **Icons**: React Icons
- **Notifications**: React Toastify

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dairy-inventory-system
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/dairy-inventory
   PORT=5000
   ```

5. **Start the application**

   **Option 1: Run both frontend and backend together**
   ```bash
   npm run dev
   ```

   **Option 2: Run separately**
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/alerts/low-stock` - Get low stock products

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create new sale
- `GET /api/sales/stats/summary` - Get sales statistics
- `GET /api/sales/stats/range` - Get sales by date range

### Inventory
- `GET /api/inventory` - Get all inventory movements
- `POST /api/inventory/add-stock` - Add stock
- `POST /api/inventory/adjust-stock` - Adjust stock
- `POST /api/inventory/record-loss` - Record loss/damage
- `GET /api/inventory/summary` - Get inventory summary

## Usage

### Adding Products
1. Navigate to the Products page
2. Click "Add Product"
3. Fill in product details (name, category, price, stock, etc.)
4. Save the product

### Creating Sales
1. Go to the Sales page
2. Click "New Sale"
3. Enter customer information
4. Add products to the sale
5. Complete the transaction

### Managing Inventory
1. Visit the Inventory page
2. Use the buttons to:
   - Add Stock: Increase product quantity
   - Adjust Stock: Modify stock levels
   - Record Loss: Document expired/damaged items

### Generating Reports
1. Go to the Reports page
2. Select report type (Sales, Inventory, Products)
3. Set date range for sales reports
4. View and export reports

## Database Schema

### Product Schema
```javascript
{
  name: String,
  category: String,
  description: String,
  price: Number,
  cost: Number,
  unit: String,
  stockQuantity: Number,
  minStockLevel: Number,
  supplier: String,
  expiryDate: Date,
  isActive: Boolean
}
```

### Sale Schema
```javascript
{
  customerName: String,
  customerPhone: String,
  items: [{
    product: ObjectId,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  totalAmount: Number,
  paymentMethod: String,
  paymentStatus: String,
  discount: Number,
  notes: String
}
```

### Inventory Schema
```javascript
{
  product: ObjectId,
  type: String,
  quantity: Number,
  previousStock: Number,
  newStock: Number,
  reason: String,
  reference: String,
  notes: String,
  performedBy: String
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 