import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { salesAPI, productsAPI } from '../services/api';
import { FaPlus, FaEye, FaPrint } from 'react-icons/fa';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    paymentMethod: 'Cash',
    discount: '0',
    notes: '',
    items: []
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesResponse, productsResponse] = await Promise.all([
        salesAPI.getAll(),
        productsAPI.getAll()
      ]);
      setSales(salesResponse.data);
      setProducts(productsResponse.data);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Sales error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addItem = () => {
    if (!selectedProduct || !quantity || quantity <= 0) {
      toast.error('Please select a product and enter valid quantity');
      return;
    }

    const product = products.find(p => p._id === selectedProduct);
    if (!product) {
      toast.error('Product not found');
      return;
    }

    if (product.stockQuantity < parseInt(quantity)) {
      toast.error(`Insufficient stock. Available: ${product.stockQuantity}`);
      return;
    }

    const existingItem = formData.items.find(item => item.product === selectedProduct);
    if (existingItem) {
      toast.error('Product already added to sale');
      return;
    }

    const newItem = {
      product: selectedProduct,
      quantity: parseInt(quantity),
      unitPrice: product.price,
      totalPrice: product.price * parseInt(quantity)
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setSelectedProduct('');
    setQuantity('1');
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = parseFloat(formData.discount) || 0;
    return subtotal - discount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      toast.error('Please add at least one item to the sale');
      return;
    }

    if (!formData.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    try {
      const saleData = {
        ...formData,
        totalAmount: calculateTotal(),
        discount: parseFloat(formData.discount) || 0
      };

      await salesAPI.create(saleData);
      toast.success('Sale created successfully');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create sale');
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      paymentMethod: 'Cash',
      discount: '0',
      notes: '',
      items: []
    });
    setSelectedProduct('');
    setQuantity('1');
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Loading Sales...</h2>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Sales</h1>
        <button className="btn btn-primary" onClick={openModal}>
          <FaPlus /> New Sale
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id}>
                  <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                  <td>
                    <strong>{sale.customerName}</strong>
                    {sale.customerPhone && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {sale.customerPhone}
                      </div>
                    )}
                  </td>
                  <td>
                    {sale.items.length} item(s)
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {sale.items.map(item => item.product?.name).join(', ')}
                    </div>
                  </td>
                  <td>
                    <strong>${sale.totalAmount.toFixed(2)}</strong>
                    {sale.discount > 0 && (
                      <div style={{ fontSize: '12px', color: '#dc3545' }}>
                        -${sale.discount.toFixed(2)} discount
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-info">{sale.paymentMethod}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${sale.paymentStatus === 'Paid' ? 'success' : 'warning'}`}>
                      {sale.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary">
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">New Sale</h3>
              <button className="close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    className="form-control"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Customer Phone</label>
                  <input
                    type="text"
                    name="customerPhone"
                    className="form-control"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    name="paymentMethod"
                    className="form-control"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Digital Payment">Digital Payment</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Discount</label>
                  <input
                    type="number"
                    name="discount"
                    className="form-control"
                    value={formData.discount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  className="form-control"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="2"
                />
              </div>

              <div className="card" style={{ marginTop: '20px' }}>
                <h4>Add Items</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                  <div className="form-group">
                    <label>Product</label>
                    <select
                      className="form-control"
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} - ${product.price} (Stock: {product.stockQuantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <button type="button" className="btn btn-success" onClick={addItem}>
                      Add Item
                    </button>
                  </div>
                </div>
              </div>

              {formData.items.length > 0 && (
                <div className="card" style={{ marginTop: '20px' }}>
                  <h4>Sale Items</h4>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => {
                        const product = products.find(p => p._id === item.product);
                        return (
                          <tr key={index}>
                            <td>{product?.name}</td>
                            <td>{item.quantity}</td>
                            <td>${item.unitPrice}</td>
                            <td>${item.totalPrice}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => removeItem(index)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  <div style={{ textAlign: 'right', marginTop: '15px' }}>
                    <h4>Total: ${calculateTotal().toFixed(2)}</h4>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formData.items.length === 0}>
                  Complete Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales; 