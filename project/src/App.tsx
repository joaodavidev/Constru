import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import SupplierSignupPage from './pages/SupplierSignupPage';
import CategoriesPage from './pages/CategoriesPage';
import SupplierAnnouncementPage from './pages/SupplierAnnouncementPage';
import SupportPage from './pages/SupportPage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedSupplierRoute from './components/ProtectedSupplierRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/supplier/signup" element={<SupplierSignupPage />} />
                <Route path="/supplier/dashboard" element={
                  <ProtectedSupplierRoute>
                    <SupplierAnnouncementPage />
                  </ProtectedSupplierRoute>
                } />
              </Routes>
            </main>
            <Footer />
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;