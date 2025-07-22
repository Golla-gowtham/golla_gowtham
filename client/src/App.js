import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Sales from './components/Sales';
import Inventory from './components/Inventory';
import Reports from './components/Reports';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" className="navbar-brand">
            🥛 Dairy Inventory
          </Link>
          <ul className="navbar-nav">
            <li>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/products" className={location.pathname === '/products' ? 'active' : ''}>
                Products
              </Link>
            </li>
            <li>
              <Link to="/sales" className={location.pathname === '/sales' ? 'active' : ''}>
                Sales
              </Link>
            </li>
            <li>
              <Link to="/inventory" className={location.pathname === '/inventory' ? 'active' : ''}>
                Inventory
              </Link>
            </li>
            <li>
              <Link to="/reports" className={location.pathname === '/reports' ? 'active' : ''}>
                Reports
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App; 