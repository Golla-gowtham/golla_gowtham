import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { productsAPI } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Milk',
    description: '',
    price: '',
    cost: '',
    unit: 'Liter',
    stockQuantity: '',
    minStockLevel: '10',
    supplier: '',
    expiryDate: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
      console.error('Products error:', error);
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
      name: '',
      category: 'Milk',
      description: '',
      price: '',
      cost: '',
      unit: 'Liter',
      stockQuantity: '',
      minStockLevel: '10',
      supplier: '',
      expiryDate: ''
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct._id, formData);
        toast.success('Product updated successfully');
      } else {
        await productsAPI.create(formData);
        toast.success('Product created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || 'Milk',
      description: product.description || '',
      price: (product.price !== undefined && product.price !== null) ? product.price.toString() : '',
      cost: (product.cost !== undefined && product.cost !== null) ? product.cost.toString() : '',
      unit: product.unit || 'Liter',
      stockQuantity: (product.stockQuantity !== undefined && product.stockQuantity !== null) ? product.stockQuantity.toString() : '',
      minStockLevel: (product.minStockLevel !== undefined && product.minStockLevel !== null) ? product.minStockLevel.toString() : '10',
      supplier: product.supplier || '',
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Loading Products...</h2>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openModal}>
          <FaPlus /> Add Product
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <strong>{product.name}</strong>
                    {product.description && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {product.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-info">{product.category}</span>
                  </td>
                  <td>${product.price}</td>
                  <td>
                    <span style={{ 
                      color: product.stockQuantity <= product.minStockLevel ? '#dc3545' : '#28a745',
                      fontWeight: 'bold'
                    }}>
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td>{product.unit}</td>
                  <td>
                    <span className={`badge badge-${product.isActive ? 'success' : 'danger'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary" 
                      onClick={() => handleEdit(product)}
                      style={{ marginRight: '5px' }}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDelete(product._id)}
                    >
                      <FaTrash />
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
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button className="close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Milk">Milk</option>
                  <option value="Cheese">Cheese</option>
                  <option value="Yogurt">Yogurt</option>
                  <option value="Butter">Butter</option>
                  <option value="Cream">Cream</option>
                  <option value="Ice Cream">Ice Cream</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    className="form-control"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cost *</label>
                  <input
                    type="number"
                    name="cost"
                    className="form-control"
                    value={formData.cost}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Unit *</label>
                  <select
                    name="unit"
                    className="form-control"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Liter">Liter</option>
                    <option value="Kilogram">Kilogram</option>
                    <option value="Piece">Piece</option>
                    <option value="Pack">Pack</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    className="form-control"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Min Stock Level</label>
                  <input
                    type="number"
                    name="minStockLevel"
                    className="form-control"
                    value={formData.minStockLevel}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    className="form-control"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Supplier</label>
                <input
                  type="text"
                  name="supplier"
                  className="form-control"
                  value={formData.supplier}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products; 