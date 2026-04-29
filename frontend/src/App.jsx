import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import EbookDetailPage from './pages/EbookDetailPage';
import ExplorePage from './pages/ExplorePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminPage from './pages/AdminPage';
import PartnerApplyPage from './pages/PartnerApplyPage';
import PartnerDashboardPage from './pages/PartnerDashboardPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import './index.css';
import api from './api/axios';

// Route chỉ cho admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// Route chỉ cho partner + admin
const PartnerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || (user.role !== 'partner' && user.role !== 'admin')) return <Navigate to="/profile" replace />;
  return children;
};

// Route chỉ cho user đã đăng nhập
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  // localStorage fallback (chưa đăng nhập)
  const [localCart, setLocalCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
  });
  // DB cart (đã đăng nhập)
  const [dbCart, setDbCart] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  // Khi user đăng nhập: load cart từ DB + merge localStorage lên DB
  useEffect(() => {
    if (!user) { setCartLoaded(true); return; }
    const mergeAndLoad = async () => {
      try {
        // Nếu có localStorage cart thì sync lên DB trước
        const local = JSON.parse(localStorage.getItem('cart') || '[]');
        if (local.length > 0) {
          await api.post('/cart/sync', { items: local.map(i => ({ ebookId: i._id, quantity: 1 })) });
          localStorage.removeItem('cart');
        }
        const { data } = await api.get('/cart');
        setDbCart(mapCartItems(data.items || []));
      } catch (e) { console.error('Cart load error:', e); }
      finally { setCartLoaded(true); }
    };
    mergeAndLoad();
  }, [user]);

  const mapCartItems = (items) => items.map(i => ({ ...i.ebook, _id: i.ebook._id, quantity: i.quantity }));

  // Cart hiện tại
  const cart = user ? dbCart : localCart;

  const setCart = async (value) => {
    const newCart = typeof value === 'function' ? value(cart) : value;
    if (!user) {
      setLocalCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    } else {
      // Khi setCart([]) (sau khi checkout) → clear DB
      if (newCart.length === 0) {
        await api.delete('/cart/clear').catch(() => {});
        setDbCart([]);
      } else {
        setDbCart(newCart);
      }
    }
  };

  const addToCart = async (ebook) => {
    if (!user) {
      setLocalCart(prev => {
        if (prev.find(i => i._id === ebook._id)) return prev;
        const next = [...prev, ebook];
        localStorage.setItem('cart', JSON.stringify(next));
        return next;
      });
    } else {
      try {
        const { data } = await api.post('/cart/add', { ebookId: ebook._id, quantity: 1 });
        setDbCart(mapCartItems(data.items || []));
      } catch (e) { console.error(e); }
    }
  };

  const removeFromCart = async (id) => {
    if (!user) {
      setLocalCart(prev => {
        const next = prev.filter(i => i._id !== id);
        localStorage.setItem('cart', JSON.stringify(next));
        return next;
      });
    } else {
      try {
        const { data } = await api.delete(`/cart/remove/${id}`);
        setDbCart(mapCartItems(data.items || []));
      } catch (e) { console.error(e); }
    }
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage onAddToCart={addToCart} />} />
      <Route path="/explore" element={<ExplorePage onAddToCart={addToCart} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage />} />
      <Route path="/ebooks/:id" element={<EbookDetailPage onAddToCart={addToCart} />} />
      <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} removeFromCart={removeFromCart} />} />
      <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} />} />
      <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><UserDashboardPage /></PrivateRoute>} />
      <Route path="/partner/apply" element={<PrivateRoute><PartnerApplyPage /></PrivateRoute>} />
      <Route path="/partner" element={<PartnerRoute><PartnerDashboardPage /></PartnerRoute>} />
      <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
