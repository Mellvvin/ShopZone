// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Root app component. Updated imports to match new folder structure.
// ─────────────────────────────────────────────────────────────
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// ── Components — updated paths to match new subfolder structure ──
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ChatWidget from './components/ChatWidget/ChatWidget';

// ── Pages ────────────────────────────────────────────────────────
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShippingPage from './pages/ShippingPage';
import PaymentPage from './pages/PaymentPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import OrderPage from './pages/OrderPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import AdminProductListPage from './pages/AdminProductListPage';
import AdminProductEditPage from './pages/AdminProductEditPage';
import AdminOrderListPage from './pages/AdminOrderListPage';
import AdminUserListPage from './pages/AdminUserListPage';

const App = () => {
  return (
    <Router>
      <Header />
      <main className='py-3'>
        <Container>
          <Routes>
            {/* ── Public Routes ── */}
            <Route path='/' element={<HomePage />} />
            <Route path='/product/:id' element={<ProductPage />} />
            <Route path='/cart' element={<CartPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />

            {/* ── Protected Routes ── */}
            <Route path='/shipping' element={<ShippingPage />} />
            <Route path='/payment' element={<PaymentPage />} />
            <Route path='/placeorder' element={<PlaceOrderPage />} />
            <Route path='/order/:id' element={<OrderPage />} />
            <Route path='/profile' element={<ProfilePage />} />

            {/* ── Admin Routes ── */}
            <Route path='/admin/products' element={<AdminProductListPage />} />
            <Route path='/admin/product/:id/edit' element={<AdminProductEditPage />} />
            <Route path='/admin/orders' element={<AdminOrderListPage />} />
            <Route path='/admin/users' element={<AdminUserListPage />} />

            {/* ── 404 ── */}
            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </Container>
      </main>
      <Footer />
      <ChatWidget />
    </Router>
  );
};

export default App;