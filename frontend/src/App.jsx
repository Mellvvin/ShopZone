// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Root app component.
// Container removed from main — full-width pages (HomePage,
// SpecialOffersPage) manage their own max-width internally.
// Pages that need a container import it themselves.
// ─────────────────────────────────────────────────────────────
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import SkipLink from './components/SkipLink/SkipLink';

// ── Components ───────────────────────────────────────────────
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ChatWidget from './components/ChatWidget/ChatWidget';
import Toast from './components/Toast/Toast';

// ── Pages ────────────────────────────────────────────────────
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
import AdminEnquiriesPage from './pages/AdminEnquiriesPage';
import SpecialOffersPage from './pages/SpecialOffersPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import BecomeSellerPage from './pages/BecomeSellerPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import ReturnsPolicyPage from './pages/ReturnsPolicyPage';
import BrandsPage from './pages/BrandsPage';
import BulkOrdersPage from './pages/BulkOrdersPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import FeaturedPage from './pages/FeaturedPage';
import AboutPage from './pages/AboutPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import AdminSellersPage from './pages/AdminSellersPage';
import AdminUserDetailPage from './pages/AdminUserDetailPage';



const App = () => {
  return (
    <Router>
      {/* Skip link — first focusable element on every page for keyboard users */}
      <SkipLink />
      <ScrollToTop />
      <Header />

      {/* id="main-content" is the target for the skip link */}
      {/* Container restored — full-width pages manage their own width internally */}
    <main id='main-content' className='py-3'>
        <Container>
          <Routes>
          {/* ── Public Routes ── */}
          <Route path='/' element={<HomePage />} />
          <Route path='/product/:id' element={<ProductPage />} />
          <Route path='/cart' element={<CartPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/offers' element={<SpecialOffersPage />} />
          <Route path='/faq' element={<FAQPage />} />
          <Route path='/contact' element={<ContactPage />} />
          <Route path='/become-seller' element={<BecomeSellerPage />} />
          <Route path='/shipping-policy' element={<ShippingPolicyPage />} />
          <Route path='/returns-policy' element={<ReturnsPolicyPage />} />
          <Route path='/brands' element={<BrandsPage />} />
          <Route path='/bulk-orders' element={<BulkOrdersPage />} />
          <Route path='/about' element={<AboutPage />} />

          {/* ── Seller Routes ── */}
          <Route path='/seller/dashboard' element={<SellerDashboardPage />} />

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
          <Route path='/admin/enquiries' element={<AdminEnquiriesPage />} />
          <Route path='/admin/sellers' element={<AdminSellersPage />} />
        {/* ── Admin User Detail ── */}
          <Route path='/admin/users/:id' element={<AdminUserDetailPage />} />

        {/* ── New Arrivals ── */}
          <Route path='/new-arrivals' element={<NewArrivalsPage />} />

          {/* ── Featured Products ── */}
          <Route path='/featured' element={<FeaturedPage />} />

        {/* ── 404 ── */}
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
        </Container>
      </main>

      <Footer />
      <ChatWidget />
      <Toast />
    </Router>
  );
};

export default App;