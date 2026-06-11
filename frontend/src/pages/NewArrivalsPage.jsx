// frontend/src/pages/NewArrivalsPage.jsx
// ─────────────────────────────────────────────────────────────
// New Arrivals page — shows all recently added products sorted
// by newest first. Uses the working page design system
// (SpecialOffersPage style) — clean hero strip, product grid,
// no heavy animation.
//
// Reuses the listNewArrivals thunk from productSlice but without
// a limit so all new products are shown, not just the homepage
// preview of 4.
//
// Route: /new-arrivals
// ─────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Spinner, Alert } from 'react-bootstrap';
import { FaClock, FaArrowLeft } from 'react-icons/fa';
import { listProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { showToast } from '../components/Toast/Toast';
import ProductCard from '../components/ProductCard/ProductCard';
import './NewArrivalsPage.css';

const NewArrivalsPage = () => {
    const dispatch = useDispatch();

    // Use the general products list with sort=newest and no limit
    // so every product is shown, not just the homepage preview
    const { products, loadingList, errorList } = useSelector(
        (state) => state.products
    );

    useEffect(() => {
        document.title = 'New Arrivals — ShopZone';
        // Fetch all products sorted newest first — no limit
        dispatch(listProducts({ sort: 'newest' }));
    }, [dispatch]);

    const addToCartHandler = (product) => {
        dispatch(addToCart({ id: product._id, qty: 1 }));
        showToast(`${product.name} added to cart`, 'success');
    };

    return (
        <div className='na-page'>

            {/* ── Hero strip ───────────────────────────────── */}
            <div className='na-hero'>
                <div className='na-hero__inner'>
                    <div className='na-hero__left'>
                        <div className='na-hero__eyebrow'>
                            <FaClock aria-hidden='true' /> Just Landed
                        </div>
                        <h1 className='na-hero__title'>New Arrivals</h1>
                        <p className='na-hero__sub'>
                            The latest products added to ShopZone — updated as new stock arrives.
                        </p>
                    </div>
                    <Link to='/' className='na-back-link'>
                        <FaArrowLeft aria-hidden='true' /> Back to Shop
                    </Link>
                </div>
            </div>

            {/* ── Content ──────────────────────────────────── */}
            <div className='na-content'>

                {loadingList ? (
                    <div className='na-state'>
                        <Spinner animation='border' className='na-spinner' />
                        <p>Loading new arrivals…</p>
                    </div>
                ) : errorList ? (
                    <Alert variant='danger' className='na-error'>{errorList}</Alert>
                ) : products.length === 0 ? (
                    <div className='na-state'>
                        <p className='na-empty'>No products found. Check back soon.</p>
                        <Link to='/' className='na-browse-btn'>Browse All Products</Link>
                    </div>
                ) : (
                    <>
                        {/* Product count */}
                        <p className='na-count'>
                            {products.length} product{products.length !== 1 ? 's' : ''} listed
                        </p>

                        {/* Product grid — reuses ProductCard component */}
                        <div className='na-grid'>
                            {products.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    onAddToCart={() => addToCartHandler(product)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

        </div>
    );
};

export default NewArrivalsPage;