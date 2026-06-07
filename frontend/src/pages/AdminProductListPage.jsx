// frontend/src/pages/AdminProductListPage.jsx
// ─────────────────────────────────────────────────────────────
// Admin page — lists all products with edit and delete actions.
// Follows the ShopZone admin design system:
//   - Full-width own layout (no App.jsx Container)
//   - Tan FaBoxOpen icon header, title, subtitle
//   - Right-side count pills: total, out-of-stock red, on-sale green
//   - Tabs: All / Featured / On Sale / Clearance / Out of Stock
//   - Search bar filtering by name, ID, brand, category
//   - Clicking a row navigates to /admin/product/:id/edit
//   - Create Product button in header right
// ─────────────────────────────────────────────────────────────
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import axios from 'axios';
import { showToast } from '../components/Toast/Toast';
import {
    FaBoxOpen, FaSearch, FaTimes, FaExclamationTriangle,
    FaStar, FaTag, FaEraser, FaExclamationCircle, FaPlus,
    FaEdit, FaTrash,
} from 'react-icons/fa';
import './AdminProductListPage.css';// ─────────────────────────────────────────────────────────────
// AdminProductListPage component
// ─────────────────────────────────────────────────────────────
const AdminProductListPage = () => {
    const navigate     = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => { document.title = 'Admin: Products — ShopZone'; }, []);

    // ── Data state ────────────────────────────────────────────
    const [products, setProducts]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState(null);

    // ── Delete modal ──────────────────────────────────────────
    const [deleteId, setDeleteId]           = useState(null);
    const [deleteName, setDeleteName]       = useState('');
    const [showModal, setShowModal]         = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // ── Filter state ──────────────────────────────────────────
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch]       = useState('');

    const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) { navigate('/login'); return; }
        fetchProducts();
    }, [userInfo, navigate]);

    // ── Fetch all products ────────────────────────────────────
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/products?limit=1000', config);
            // API returns { products, page, pages } when paginated
            // or a plain array — handle both
            setProducts(Array.isArray(data) ? data : (data.products || []));
            setError(null);
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    // ── Derived counts for pills and tab badges ───────────────
    const outOfStockCount = useMemo(
        () => products.filter(p => p.countInStock === 0).length,
        [products]
    );
    const onSaleCount = useMemo(
        () => products.filter(p => p.isOnSale || p.isClearance).length,
        [products]
    );
    const featuredCount = useMemo(
        () => products.filter(p => p.isFeatured).length,
        [products]
    );
    const clearanceCount = useMemo(
        () => products.filter(p => p.isClearance).length,
        [products]
    );

    // ── Tab + search filtering ────────────────────────────────
    const filteredProducts = useMemo(() => {
        let list = products;
        // Tab filter
        if (activeTab === 'featured')   list = list.filter(p => p.isFeatured);
        if (activeTab === 'sale')       list = list.filter(p => p.isOnSale && !p.isClearance);
        if (activeTab === 'clearance')  list = list.filter(p => p.isClearance);
        if (activeTab === 'outofstock') list = list.filter(p => p.countInStock === 0);
        // Search filter
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p._id.toLowerCase().includes(q) ||
                (p.brand || '').toLowerCase().includes(q) ||
                (p.category || '').toLowerCase().includes(q)
            );
        }
        return list;
    }, [products, activeTab, search]);

    // ── Delete handlers ───────────────────────────────────────
    const confirmDelete = (id, name) => {
        setDeleteId(id);
        setDeleteName(name);
        setShowModal(true);
    };

    const deleteHandler = async () => {
        try {
            setDeleteLoading(true);
            await axios.delete(`/api/products/${deleteId}`, config);
            setShowModal(false);
            showToast('Product deleted successfully.', 'success');
            fetchProducts();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setDeleteLoading(false);
            setShowModal(false);
        }
    };

    // ── Create product ────────────────────────────────────────
    const createProductHandler = async () => {
        try {
            const { data } = await axios.post(
                '/api/products',
                {
                    name: 'New Product',
                    price: 0,
                    image: '/images/sample.jpg',
                    category: 'General Merchandise',
                    description: 'Product description',
                    countInStock: 0,
                    unit: 'Per Unit',
                },
                { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } }
            );
            showToast('New product created. Fill in the details below.', 'info');
            navigate(`/admin/product/${data._id}/edit`);
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            showToast(msg, 'error');
        }
    };

    // ── Tab definitions ───────────────────────────────────────
    const TABS = [
        { key: 'all',        label: 'All Products', icon: FaBoxOpen,          count: products.length,   countMod: '' },
        { key: 'featured',   label: 'Featured',     icon: FaStar,             count: featuredCount,     countMod: 'oxford' },
        { key: 'sale',       label: 'On Sale',      icon: FaTag,              count: onSaleCount,       countMod: 'green' },
        { key: 'clearance',  label: 'Clearance',    icon: FaEraser,           count: clearanceCount,    countMod: 'amber' },
        { key: 'outofstock', label: 'Out of Stock', icon: FaExclamationCircle,count: outOfStockCount,   countMod: 'red' },
    ];

    return (
        <div className='apl-page'>

            {/* ── Delete confirmation modal ──────────────── */}
            <ConfirmModal
                show={showModal}
                onConfirm={deleteHandler}
                onCancel={() => setShowModal(false)}
                title='Delete Product'
                message={`Are you sure you want to delete "${deleteName}"?`}
                subMessage='This action cannot be undone. Stock will be permanently removed.'
                confirmLabel={deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                confirmVariant='danger'
            />

            {/* ── Page header ────────────────────────────── */}
            <div className='apl-header'>
                <div className='apl-header__left'>
                    <FaBoxOpen className='apl-header__icon' aria-hidden='true' />
                    <div>
                        <h1 className='apl-header__title'>Product Management</h1>
                        <p className='apl-header__subtitle'>
                            All products listed on ShopZone
                        </p>
                    </div>
                </div>

                {/* Right side — count pills + create button */}
                <div className='apl-header__right'>
                    <div className='apl-header__counts'>
                        <div className='apl-count-pill'>
                            <span className='apl-count-pill__num'>{products.length}</span>
                            <span className='apl-count-pill__label'>Total</span>
                        </div>
                        {outOfStockCount > 0 && (
                            <div className='apl-count-pill apl-count-pill--red'>
                                <span className='apl-count-pill__num'>{outOfStockCount}</span>
                                <span className='apl-count-pill__label'>Out of Stock</span>
                            </div>
                        )}
                        {onSaleCount > 0 && (
                            <div className='apl-count-pill apl-count-pill--green'>
                                <span className='apl-count-pill__num'>{onSaleCount}</span>
                                <span className='apl-count-pill__label'>On Sale</span>
                            </div>
                        )}
                    </div>

                    <button
                        className='apl-create-btn'
                        onClick={createProductHandler}
                        aria-label='Create new product'
                    >
                        <FaPlus aria-hidden='true' /> Create Product
                    </button>
                </div>
            </div>

            {/* ── Tab bar ────────────────────────────────── */}
            <div className='apl-tabs' role='tablist'>
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            className={`apl-tab ${activeTab === tab.key ? 'apl-tab--active' : ''}`}
                            onClick={() => { setActiveTab(tab.key); setSearch(''); }}
                            role='tab'
                            aria-selected={activeTab === tab.key}
                        >
                            <Icon aria-hidden='true' />
                            {tab.label}
                            <span className={`apl-tab__count ${tab.countMod ? `apl-tab__count--${tab.countMod}` : ''}`}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Search bar ─────────────────────────────── */}
            <div className='apl-search-bar'>
                <FaSearch className='apl-search-bar__icon' aria-hidden='true' />
                <input
                    type='text'
                    className='apl-search-bar__input'
                    placeholder='Search by name, ID, brand or category...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label='Search products'
                />
                {search && (
                    <button
                        className='apl-search-bar__clear'
                        onClick={() => setSearch('')}
                        aria-label='Clear search'
                    >
                        <FaTimes aria-hidden='true' />
                    </button>
                )}
            </div>

            {/* ── Error ──────────────────────────────────── */}
            {error && (
                <div className='apl-error'>
                    <FaExclamationTriangle aria-hidden='true' /> {error}
                </div>
            )}

            {/* ── Content ────────────────────────────────── */}
            {loading ? (
                <div className='apl-state'>
                    <div className='apl-spinner' aria-label='Loading…' />
                    <p>Loading products…</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className='apl-state'>
                    <FaBoxOpen aria-hidden='true' />
                    <p>
                        {search
                            ? `No products matching "${search}"`
                            : `No ${activeTab === 'all' ? '' : activeTab} products found.`
                        }
                    </p>
                    {search && (
                        <button className='apl-clear-btn' onClick={() => setSearch('')}>
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <div className='apl-table-wrap'>
                    <p className='apl-results-count'>
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                    </p>
                    <table className='apl-table' aria-label='Products table'>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Category</th>
                                <th>Brand</th>
                                <th>Unit</th>
                                <th>Stock</th>
                                <th>Flags</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product, index) => (
                                <tr
                                    key={product._id}
                                    className={`apl-row ${index % 2 !== 0 ? 'apl-row--alt' : ''}`}
                                    onClick={() => navigate(`/admin/product/${product._id}/edit`)}
                                    style={{ cursor: 'pointer' }}
                                    title={`Edit ${product.name}`}
                                >
                                    {/* Thumbnail */}
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className='apl-thumb'
                                        />
                                    </td>

                                    {/* Name */}
                                    <td className='apl-cell-name'>
                                        {product.name}
                                    </td>

                                    {/* Price */}
                                    <td className='apl-cell-price'>
                                        KES {Number(product.salePrice || product.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                                        {(product.isOnSale || product.isClearance) && product.salePrice && (
                                            <span className='apl-original-price'>
                                                {Number(product.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                                            </span>
                                        )}
                                    </td>

                                    {/* Category */}
                                    <td className='apl-cell-muted'>{product.category}</td>

                                    {/* Brand */}
                                    <td className='apl-cell-muted'>{product.brand || '—'}</td>

                                    {/* Unit */}
                                    <td>
                                        <span className='apl-unit-badge'>
                                            {product.unitType || product.unit || 'Per Unit'}
                                        </span>
                                    </td>

                                    {/* Stock */}
                                    <td>
                                        <span className={product.countInStock > 0 ? 'apl-stock--in' : 'apl-stock--out'}>
                                            {product.countInStock}
                                        </span>
                                    </td>

                                    {/* Flags — featured, sale, clearance */}
                                    <td>
                                        <div className='apl-flags'>
                                            {product.isFeatured  && <span className='apl-flag apl-flag--featured'>Featured</span>}
                                            {product.isOnSale    && <span className='apl-flag apl-flag--sale'>Sale</span>}
                                            {product.isClearance && <span className='apl-flag apl-flag--clearance'>Clearance</span>}
                                        </div>
                                    </td>

                                    {/* Actions — stop propagation */}
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className='apl-actions'>
                                            <button
                                                className='apl-action-btn apl-action-btn--edit'
                                                onClick={() => navigate(`/admin/product/${product._id}/edit`)}
                                                aria-label={`Edit ${product.name}`}
                                            >
                                                <FaEdit aria-hidden='true' /> Edit
                                            </button>
                                            <button
                                                className='apl-action-btn apl-action-btn--delete'
                                                onClick={() => confirmDelete(product._id, product.name)}
                                                aria-label={`Delete ${product.name}`}
                                            >
                                                <FaTrash aria-hidden='true' /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminProductListPage;