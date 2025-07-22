import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { inventoryAPI, productsAPI } from '../services/api';
import { FaPlus, FaBoxes, FaExclamationTriangle } from 'react-icons/fa';

const Inventory = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // add, adjust, loss
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    reason: '',
    reference: '',
    notes: '',
    performedBy: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [movementsResponse, productsResponse, summaryResponse] = await Promise.all([
        inventoryAPI.getAll(),
        productsAPI.getAll(),
        inventoryAPI.getSummary()
      ]);
      setMovements(movementsResponse.data);
      setProducts(productsResponse.data);
      setSummary(summaryResponse.data);
    } catch (error) {
      toast.error('Failed to load inventory data');
      console.error('Inventory error:', error);
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

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      reason: '',
      reference: '',
      notes: '',
      performedBy: ''
    });
  };

  const openModal = (type) => {
    setModalType(type);
    resetForm();
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.quantity || !formData.reason || !formData.performedBy) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let response;
      switch (modalType) {
        case 'add':
          response = await inventoryAPI.addStock(formData);
          break;
        case 'adjust':
          response = await inventoryAPI.adjustStock(formData);
          break;
        case 'loss':
          response = await inventoryAPI.recordLoss({
            ...formData,
            type: formData.reason.includes('expiry') ? 'Expiry' : 'Damage'
          });
          break;
        default:
          throw new Error('Invalid modal type');
      }

      toast.success('Inventory movement recorded successfully');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record inventory movement');
    }
  };

  const getMovementTypeColor = (type) => {
    switch (type) {
      case 'In': return 'success';
      case 'Out': return 'danger';
      case 'Adjustment': return 'warning';
      case 'Expiry': return 'danger';
      case 'Damage': return 'danger';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Loading Inventory...</h2>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Inventory Management</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-success" onClick={() => openModal('add')}>
            <FaPlus /> Add Stock
          </button>
          <button className="btn btn-warning" onClick={() => openModal('adjust')}>
            <FaBoxes /> Adjust Stock
          </button>
          <button className="btn btn-danger" onClick={() => openModal('loss')}>
            <FaExclamationTriangle /> Record Loss
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <FaBoxes style={{ fontSize: '2rem', color: '#007bff', marginBottom: '10px' }} />
          <h3>{summary.totalProducts || 0}</h3>
          <p>Total Products</p>
        </div>
        
        <div className="stat-card">
          <FaExclamationTriangle style={{ fontSize: '2rem', color: '#dc3545', marginBottom: '10px' }} />
          <h3>{summary.lowStockProducts || 0}</h3>
          <p>Low Stock Items</p>
        </div>
        
        <div className="stat-card">
          <span style={{ fontSize: '2rem', color: '#28a745', marginBottom: '10px' }}>$</span>
          <h3>${(summary.totalStockValue || 0).toFixed(2)}</h3>
          <p>Total Stock Value</p>
        </div>
      </div>

      <div className="card">
        <h3>Recent Inventory Movements</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Previous Stock</th>
                <th>New Stock</th>
                <th>Reason</th>
                <th>Performed By</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement._id}>
                  <td>{new Date(movement.createdAt).toLocaleDateString()}</td>
                  <td>
                    <strong>{movement.product?.name}</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {movement.product?.category}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${getMovementTypeColor(movement.type)}`}>
                      {movement.type}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      color: movement.type === 'In' ? '#28a745' : '#dc3545',
                      fontWeight: 'bold'
                    }}>
                      {movement.type === 'In' ? '+' : ''}{movement.quantity}
                    </span>
                  </td>
                  <td>{movement.previousStock}</td>
                  <td>
                    <strong>{movement.newStock}</strong>
                  </td>
                  <td>{movement.reason}</td>
                  <td>{movement.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {modalType === 'add' && 'Add Stock'}
                {modalType === 'adjust' && 'Adjust Stock'}
                {modalType === 'loss' && 'Record Loss'}
              </h3>
              <button className="close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product *</label>
                <select
                  name="productId"
                  className="form-control"
                  value={formData.productId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name} (Current Stock: {product.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  className="form-control"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Reason *</label>
                <input
                  type="text"
                  name="reason"
                  className="form-control"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder={
                    modalType === 'add' ? 'e.g., New shipment, Restock' :
                    modalType === 'adjust' ? 'e.g., Stock correction, Inventory count' :
                    'e.g., Expired, Damaged, Lost'
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Reference</label>
                <input
                  type="text"
                  name="reference"
                  className="form-control"
                  value={formData.reference}
                  onChange={handleInputChange}
                  placeholder="e.g., Invoice number, PO number"
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  className="form-control"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="form-group">
                <label>Performed By *</label>
                <input
                  type="text"
                  name="performedBy"
                  className="form-control"
                  value={formData.performedBy}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={`btn btn-${
                  modalType === 'add' ? 'success' : 
                  modalType === 'adjust' ? 'warning' : 'danger'
                }`}>
                  {modalType === 'add' && 'Add Stock'}
                  {modalType === 'adjust' && 'Adjust Stock'}
                  {modalType === 'loss' && 'Record Loss'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory; 