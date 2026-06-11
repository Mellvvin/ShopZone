// frontend/src/pages/FeaturedPage.jsx
// ─────────────────────────────────────────────────────────────
// Featured Products page — shows all products marked isFeatured.
// Working page design system — matches NewArrivalsPage pattern.
// Clean Oxford Blue hero strip, product count, full product grid.
//
// Uses listProducts({ featured: true }) with no limit so all
// featured products are shown, not just the homepage preview of 8.
//
// Route: /featured
// ─────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Spinner, Alert } from 'react-bootstrap';
import { FaStar, FaArrowLeft } from 'react-icons/fa';
import { listProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { showToast } from '../components/Toast/Toast';
import ProductCard from '../components/ProductCard/ProductCard';
import './FeaturedPage.css';

const FeaturedPage = () => {
    const dispatch = useDispatch();

    const { products, loadingList, errorList } = useSelector(
        (state) => state.products
    );

    useEffect(() => {
        document.title = 'Featured Products — ShopZone';
        dispatch(listProducts({ featured: true }));
    }, [dispatch]);

    const addToCartHandler = (product) => {
        dispatch(addToCart({ id: product._id, qty: 1 }));
        showToast(`${product.name} added to cart`, 'success');
    };

    return (
        <div className='fp-page'>

            {/* ── Hero strip ───────────────────────────────── */}
            <div className='fp-hero'>
                <div className='fp-hero__inner'>
                    <div className='fp-hero__left'>
                        <div className='fp-hero__eyebrow'>
                            <FaStar aria-hidden='true' /> Curated Selection
                        </div>
                        <h1 className='fp-hero__title'>Featured Products</h1>
                        <p className='fp-hero__sub'>
                            Handpicked wholesale favourites — verified quality, reliable stock, ready to order.
                        </p>
                    </div>
                    <Link to='/' className='fp-back-link'>
                        <FaArrowLeft aria-hidden='true' /> Back to Shop
                    </Link>
                </div>
            </div>

            {/* ── Content ──────────────────────────────────── */}
            <div className='fp-content'>

                {loadingList ? (
                    <div className='fp-state'>
                        <Spinner animation='border' className='fp-spinner' />
                        <p>Loading featured products…</p>
                    </div>
                ) : errorList ? (
                    <Alert variant='danger' className='fp-error'>{errorList}</Alert>
                ) : products.length === 0 ? (
                    <div className='fp-state'>
                        <p className='fp-empty'>No featured products at the moment. Check back soon.</p>
                        <Link to='/' className='fp-browse-btn'>Browse All Products</Link>
                    </div>
                ) : (
                    <>
                        <p className='fp-count'>
                            {products.length} featured product{products.length !== 1 ? 's' : ''}
                        </p>
                        <div className='fp-grid'>
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

export default FeaturedPage;