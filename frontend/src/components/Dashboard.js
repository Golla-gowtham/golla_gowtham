import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { salesAPI, inventoryAPI, productsAPI } from '../services/api';
import { FaShoppingCart, FaBoxes, FaExclamationTriangle, FaDollarSign } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    sales: {},
    inventory: {},
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [salesStats, inventoryStats, lowStockProducts] = await Promise.all([
        salesAPI.getStats(),
        inventoryAPI.getSummary(),
        productsAPI.getLowStock()
      ]);

      setStats({
        sales: salesStats.data,
        inventory: inventoryStats.data,
        lowStockProducts: lowStockProducts.data
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>Dashboard</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <FaShoppingCart style={{ fontSize: '2rem', color: '#007bff', marginBottom: '10px' }} />
          <h3>{stats.sales.todaySales || 0}</h3>
          <p>Today's Sales</p>
        </div>
        
        <div className="stat-card">
          <FaDollarSign style={{ fontSize: '2rem', color: '#28a745', marginBottom: '10px' }} />
          <h3>${(stats.sales.todayRevenue || 0).toFixed(2)}</h3>
          <p>Today's Revenue</p>
        </div>
        
        <div className="stat-card">
          <FaBoxes style={{ fontSize: '2rem', color: '#ffc107', marginBottom: '10px' }} />
          <h3>{stats.inventory.totalProducts || 0}</h3>
          <p>Total Products</p>
        </div>
        
        <div className="stat-card">
          <FaExclamationTriangle style={{ fontSize: '2rem', color: '#dc3545', marginBottom: '10px' }} />
          <h3>{stats.inventory.lowStockProducts || 0}</h3>
          <p>Low Stock Items</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h3>Recent Sales Summary</h3>
          <div style={{ marginTop: '15px' }}>
            <p><strong>Total Sales:</strong> {stats.sales.totalSales || 0}</p>
            <p><strong>Total Revenue:</strong> ${(stats.sales.totalRevenue || 0).toFixed(2)}</p>
            <p><strong>Today's Sales:</strong> {stats.sales.todaySales || 0}</p>
            <p><strong>Today's Revenue:</strong> ${(stats.sales.todayRevenue || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="card">
          <h3>Inventory Summary</h3>
          <div style={{ marginTop: '15px' }}>
            <p><strong>Total Products:</strong> {stats.inventory.totalProducts || 0}</p>
            <p><strong>Low Stock Items:</strong> {stats.inventory.lowStockProducts || 0}</p>
            <p><strong>Total Stock Value:</strong> ${(stats.inventory.totalStockValue || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {stats.lowStockProducts.length > 0 && (
        <div className="card">
          <h3 style={{ color: '#dc3545' }}>⚠️ Low Stock Alerts</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Min Stock Level</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockProducts.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td style={{ color: '#dc3545', fontWeight: 'bold' }}>
                      {product.stockQuantity}
                    </td>
                    <td>{product.minStockLevel}</td>
                    <td>{product.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats.inventory.recentMovements && stats.inventory.recentMovements.length > 0 && (
        <div className="card">
          <h3>Recent Inventory Movements</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.inventory.recentMovements.slice(0, 10).map((movement) => (
                  <tr key={movement._id}>
                    <td>{movement.product?.name}</td>
                    <td>
                      <span className={`badge badge-${movement.type === 'In' ? 'success' : 'danger'}`}>
                        {movement.type}
                      </span>
                    </td>
                    <td>{movement.quantity}</td>
                    <td>{movement.reason}</td>
                    <td>{new Date(movement.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 