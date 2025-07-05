import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import Home from './page/Home';
import Shop from './page/Shop';
import Order from './page/Order';
import Profile from './page/Profile';
import Navbar from './components/Navbar';
import Login from './page/Login';
import ForgotPassword from './page/ForgotPassword';
import Admin from './page/Admin';
import MyOrder from './page/MyOrder';
import Transaction from './page/Transaction';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <AuthProvider>
        <Router>
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/order" element={<Order />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/my-orders" element={<MyOrder />} />
              <Route path="/transaction/:orderId" element={<Transaction />} />
              {/* Add more routes as needed */}
            </Routes>
          </main>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{ zIndex: 9999 }}
          />
        </Router>
      </AuthProvider>
    </div>
  );
};

export default App;
