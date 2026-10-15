import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaHome, FaThLarge, FaShoppingCart, FaUser, FaEllipsisH } from 'react-icons/fa';
import './BottomNav.css';

const BottomNav = () => {
  const { pathname, search } = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const onCategoryListing = pathname === '/' && search.includes('category=');

  const tabs = [
    { key: 'home', label: 'Home', icon: <FaHome />, to: '/',
      active: pathname === '/' && !onCategoryListing },
    { key: 'categories', label: 'Categories', icon: <FaThLarge />, to: '/categories',
      active: pathname === '/categories' || onCategoryListing },
    { key: 'cart', label: 'Cart', icon: <FaShoppingCart />, to: '/cart',
      active: pathname === '/cart', badge: totalItems },
    { key: 'profile', label: 'Profile', icon: <FaUser />,
      to: userInfo ? '/profile' : '/login',
      state: userInfo ? undefined : { from: '/profile' },
      active: pathname === '/profile' },
  ];

  // "More" opens the existing drawer, which lives inside Header, so it
  // asks for it with a window event rather than shared state.
    const openDrawer = () => window.dispatchEvent(new Event('shopzone:open-drawer'));
  // Any tab tap dismisses the drawer, even if the route doesn't change
  const closeDrawer = () => window.dispatchEvent(new Event('shopzone:close-drawer'));

  return (
    <nav className='bottom-nav' aria-label='Main navigation'>
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          to={tab.to}
          state={tab.state}
          className={`bottom-nav__tab${tab.active ? ' bottom-nav__tab--active' : ''}`}
          aria-current={tab.active ? 'page' : undefined}
          onClick={closeDrawer}
        >
          <span className='bottom-nav__icon' aria-hidden='true'>
            {tab.icon}
            {tab.badge > 0 && <span className='bottom-nav__badge'>{tab.badge}</span>}
          </span>
          <span className='bottom-nav__label'>{tab.label}</span>
        </Link>
      ))}
      <button type='button' className='bottom-nav__tab' onClick={openDrawer} aria-label='More options'>
        <span className='bottom-nav__icon' aria-hidden='true'><FaEllipsisH /></span>
        <span className='bottom-nav__label'>More</span>
      </button>
    </nav>
  );
};

export default BottomNav;