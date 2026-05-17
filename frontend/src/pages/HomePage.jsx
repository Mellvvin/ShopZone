// frontend/src/pages/HomePage.jsx
// ─────────────────────────────────────────────────────────────
// Homepage — displays the product grid.
//
// Step 11 update:
//   Reads URL query params (keyword, category, deals, featured,
//   clearance, tag) and passes them to listProducts so the
//   category bar, deals link and search all filter correctly.
// ─────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { listProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';

const HomePage = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  // ── Read products from Redux store ────────────────────────
  const { products, loadingList, errorList } = useSelector(
    (state) => state.products
  );

  // ── Re-fetch whenever the URL query string changes ────────
  // This means clicking Deals, Categories, or searching all
  // trigger a fresh fetch with the correct filters applied.
  useEffect(() => {
    // Parse the current URL query string into an object
    // Example: ?keyword=samsung&category=Electronics
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword') || '';
    const category = params.get('category') || '';
    const deals = params.get('deals') === 'true';
    const featured = params.get('featured') === 'true';
    const clearance = params.get('clearance') === 'true';
    const tag = params.get('tag') || '';

    // Build filters object — only include non-empty values
    const filters = {};
    if (keyword) filters.keyword = keyword;
    if (category) filters.category = category;
    if (deals) filters.deals = true;
    if (featured) filters.featured = true;
    if (clearance) filters.clearance = true;
    if (tag) filters.tag = tag;

    // Dispatch — fetches all products if filters is empty,
    // or filtered products if any param is present
    dispatch(listProducts(filters));
  }, [dispatch, location.search]);

  // ── Page heading based on active filter ──────────────────
  // Shows a contextual title so users know what they're seeing.
  const getHeading = () => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword');
    const category = params.get('category');
    const deals = params.get('deals');
    const featured = params.get('featured');

    if (keyword) return `Search results for "${keyword}"`;
    if (category) return category;
    if (deals) return 'Deals & Special Offers';
    if (featured) return 'Featured Products';
    return 'Latest Products';
  };

  return (
    <>
      {/* ── Page heading ──────────────────────────────────── */}
      <h1 className='page-title'>{getHeading()}</h1>

      {/* ── Error state ───────────────────────────────────── */}
      {errorList && (
        <div className='alert alert-danger'>{errorList}</div>
      )}

      {/* ── Product grid ──────────────────────────────────── */}
      <Row>
        {loadingList ? (
          // Show skeleton cards while loading
          [...Array(8)].map((_, i) => (
            <Col key={i} xs={12} sm={6} md={4} lg={3} className='mb-4'>
              <SkeletonCard />
            </Col>
          ))
        ) : products.length === 0 ? (
          // Empty state
          <Col>
            <div className='alert alert-warning'>
              No products found. Try a different search or category.
            </div>
          </Col>
        ) : (
          // Product cards
          products.map((product) => (
            <Col key={product._id} xs={12} sm={6} md={4} lg={3} className='mb-4'>
              <ProductCard product={product} />
            </Col>
          ))
        )}
      </Row>
    </>
  );
};

export default HomePage;