import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { salesAPI, inventoryAPI, productsAPI } from '../services/api';
import { FaChartBar, FaCalendarAlt, FaDownload } from 'react-icons/fa';

const Reports = () => {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      let data;
      switch (reportType) {
        case 'sales':
          data = await salesAPI.getByDateRange(dateRange.startDate, dateRange.endDate);
          setReportData(data.data);
          break;
        case 'inventory':
          const [inventorySummary, products] = await Promise.all([
            inventoryAPI.getSummary(),
            productsAPI.getAll()
          ]);
          setReportData({
            summary: inventorySummary.data,
            products: products.data
          });
          break;
        case 'products':
          const productsData = await productsAPI.getAll();
          setReportData(productsData.data);
          break;
        default:
          throw new Error('Invalid report type');
      }
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('Report error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [reportType]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const exportReport = () => {
    if (!reportData) return;
    
    let csvContent = '';
    let filename = '';
    
    switch (reportType) {
      case 'sales':
        filename = `sales-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
        csvContent = generateSalesCSV(reportData);
        break;
      case 'inventory':
        filename = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
        csvContent = generateInventoryCSV(reportData);
        break;
      case 'products':
        filename = `products-report-${new Date().toISOString().split('T')[0]}.csv`;
        csvContent = generateProductsCSV(reportData);
        break;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateSalesCSV = (data) => {
    let csv = 'Date,Customer,Items,Total Amount,Payment Method,Status\n';
    data.sales.forEach(sale => {
      csv += `${new Date(sale.createdAt).toLocaleDateString()},"${sale.customerName}",${sale.items.length},${sale.totalAmount},"${sale.paymentMethod}","${sale.paymentStatus}"\n`;
    });
    return csv;
  };

  const generateInventoryCSV = (data) => {
    let csv = 'Product Name,Category,Stock Quantity,Unit Price,Stock Value,Status\n';
    data.products.forEach(product => {
      const stockValue = product.stockQuantity * product.price;
      const status = product.stockQuantity <= product.minStockLevel ? 'Low Stock' : 'OK';
      csv += `"${product.name}","${product.category}",${product.stockQuantity},${product.price},${stockValue},"${status}"\n`;
    });
    return csv;
  };

  const generateProductsCSV = (data) => {
    let csv = 'Product Name,Category,Price,Cost,Stock Quantity,Unit,Supplier,Status\n';
    data.forEach(product => {
      csv += `"${product.name}","${product.category}",${product.price},${product.cost},${product.stockQuantity},"${product.unit}","${product.supplier || ''}","${product.isActive ? 'Active' : 'Inactive'}"\n`;
    });
    return csv;
  };

  return (
    <div>
      <h1>Reports & Analytics</h1>
      
      <div className="card">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <label>Report Type:</label>
            <select 
              className="form-control" 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
              style={{ width: '200px' }}
            >
              <option value="sales">Sales Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="products">Products Report</option>
            </select>
          </div>
          
          {reportType === 'sales' && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
              <div>
                <label>Start Date:</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-control"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                />
              </div>
              <div>
                <label>End Date:</label>
                <input
                  type="date"
                  name="endDate"
                  className="form-control"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                />
              </div>
              <button className="btn btn-primary" onClick={generateReport}>
                Generate Report
              </button>
            </div>
          )}
          
          <button className="btn btn-success" onClick={exportReport} disabled={!reportData}>
            <FaDownload /> Export CSV
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3>Generating Report...</h3>
          </div>
        )}

        {!loading && reportData && (
          <div>
            {reportType === 'sales' && Array.isArray(reportData.sales) && (
              <div>
                <div className="dashboard-stats">
                  <div className="stat-card">
                    <h3>{reportData.totalSales}</h3>
                    <p>Total Sales</p>
                  </div>
                  <div className="stat-card">
                    <h3>${(typeof reportData.totalRevenue === 'number' ? reportData.totalRevenue : 0).toFixed(2)}</h3>
                    <p>Total Revenue</p>
                  </div>
                  <div className="stat-card">
                    <h3>{reportData.totalItems}</h3>
                    <p>Total Items Sold</p>
                  </div>
                </div>

                <h3>Sales Details</h3>
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
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.sales.map((sale) => (
                        <tr key={sale._id}>
                          <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                          <td>{sale.customerName}</td>
                          <td>{sale.items.length} item(s)</td>
                          <td>${sale.totalAmount.toFixed(2)}</td>
                          <td>{sale.paymentMethod}</td>
                          <td>
                            <span className={`badge badge-${sale.paymentStatus === 'Paid' ? 'success' : 'warning'}`}>
                              {sale.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {reportType === 'sales' && (!reportData.sales || !Array.isArray(reportData.sales) || reportData.sales.length === 0) && (
              <div style={{textAlign: 'center', padding: '20px'}}>
                <h3>No sales data available for the selected date range.</h3>
              </div>
            )}

            {reportType === 'inventory' && reportData && reportData.summary && (
              <div>
                <div className="dashboard-stats">
                  <div className="stat-card">
                    <h3>{reportData.summary.totalProducts}</h3>
                    <p>Total Products</p>
                  </div>
                  <div className="stat-card">
                    <h3>{reportData.summary.lowStockProducts}</h3>
                    <p>Low Stock Items</p>
                  </div>
                  <div className="stat-card">
                    <h3>${reportData.summary.totalStockValue.toFixed(2)}</h3>
                    <p>Total Stock Value</p>
                  </div>
                </div>

                <h3>Inventory Status</h3>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Stock Quantity</th>
                        <th>Unit Price</th>
                        <th>Stock Value</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.products.map((product) => {
                        const stockValue = product.stockQuantity * product.price;
                        const isLowStock = product.stockQuantity <= product.minStockLevel;
                        return (
                          <tr key={product._id}>
                            <td>{product.name}</td>
                            <td>{product.category}</td>
                            <td>
                              <span style={{ 
                                color: isLowStock ? '#dc3545' : '#28a745',
                                fontWeight: 'bold'
                              }}>
                                {product.stockQuantity}
                              </span>
                            </td>
                            <td>${product.price}</td>
                            <td>${stockValue.toFixed(2)}</td>
                            <td>
                              <span className={`badge badge-${isLowStock ? 'danger' : 'success'}`}>
                                {isLowStock ? 'Low Stock' : 'OK'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportType === 'products' && Array.isArray(reportData) && (
              <div>
                <h3>Products Report</h3>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Cost</th>
                        <th>Stock Quantity</th>
                        <th>Unit</th>
                        <th>Supplier</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((product) => (
                        <tr key={product._id}>
                          <td>{product.name}</td>
                          <td>
                            <span className="badge badge-info">{product.category}</span>
                          </td>
                          <td>${product.price}</td>
                          <td>${product.cost}</td>
                          <td>
                            <span style={{ 
                              color: product.stockQuantity <= product.minStockLevel ? '#dc3545' : '#28a745',
                              fontWeight: 'bold'
                            }}>
                              {product.stockQuantity}
                            </span>
                          </td>
                          <td>{product.unit}</td>
                          <td>{product.supplier || '-'}</td>
                          <td>
                            <span className={`badge badge-${product.isActive ? 'success' : 'danger'}`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports; 