// frontend/src/components/SearchBar/SearchSuggestions.jsx
// ─────────────────────────────────────────────────────────────
// Autocomplete dropdown for the search bar.
//
// Four contextual sections:
//   1. Popular searches  — shown when input is empty
//   2. Recent searches   — shown when input is empty (from localStorage)
//   3. Recent views      — shown when input is empty (from localStorage)
//   4. Live suggestions  — shown when user is typing (API + categories + brands)
//
// localStorage keys:
//   shopzone_search_history  — array of last 8 search strings
//   shopzone_recent_views    — array of last 4 { id, name, image, price }
// ─────────────────────────────────────────────────────────────
import { FaSearch, FaClock, FaFire, FaEye, FaTag, FaStore, FaMobileAlt } from 'react-icons/fa';
import './SearchSuggestions.css';

// ── Popular search terms — updated manually as the catalogue grows ──
const POPULAR_SEARCHES = [
    'sugar 50kg', 'clothing bales', 'phone accessories',
    'cooking oil', 'exercise books', 'rice sack',
    'soap carton', 'maize flour',
];

const SearchSuggestions = ({
    keyword,
    suggestions,       // { products: [], categories: [], brands: [] }
    history,           // string[]
    recentViews,       // { id, name, image, price }[]
    loading,
    onSelectSuggestion,
    onSelectHistory,
    onSelectCategory,
    onSelectBrand,
    onSelectProduct,
    onClearHistory,
    visible,
}) => {
    if (!visible) return null;

    const isEmpty = !keyword || keyword.trim().length === 0;
    const isTyping = keyword && keyword.trim().length > 0;
    const hasResults = suggestions.products.length > 0
        || suggestions.categories.length > 0
        || suggestions.brands.length > 0;

    return (
        <div className='ss-dropdown' role='listbox' aria-label='Search suggestions'>

            {/* ── Empty input state ────────────────────────── */}
            {isEmpty && (
                <>
                    {/* Popular searches */}
                    <div className='ss-section'>
                        <div className='ss-section-header'>
                            <FaFire className='ss-section-icon ss-section-icon--fire' aria-hidden='true' />
                            Popular searches
                        </div>
                        <div className='ss-popular-grid'>
                            {POPULAR_SEARCHES.map((term) => (
                                <button
                                    key={term}
                                    className='ss-popular-pill'
                                    onClick={() => onSelectSuggestion(term)}
                                    role='option'
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent searches */}
                    {history.length > 0 && (
                        <div className='ss-section'>
                            <div className='ss-section-header'>
                                <FaClock className='ss-section-icon' aria-hidden='true' />
                                Recent searches
                                <button
                                    className='ss-clear-btn'
                                    onClick={onClearHistory}
                                    aria-label='Clear search history'
                                >
                                    Clear
                                </button>
                            </div>
                            {history.map((term) => (
                                <button
                                    key={term}
                                    className='ss-row ss-row--history'
                                    onClick={() => onSelectHistory(term)}
                                    role='option'
                                >
                                    <FaClock className='ss-row-icon' aria-hidden='true' />
                                    <span className='ss-row-text'>{term}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Recent views */}
                    {recentViews.length > 0 && (
                        <div className='ss-section'>
                            <div className='ss-section-header'>
                                <FaEye className='ss-section-icon' aria-hidden='true' />
                                Recently viewed
                            </div>
                            {recentViews.map((item) => (
                                <button
                                    key={item.id}
                                    className='ss-row ss-row--product'
                                    onClick={() => onSelectProduct(item.id)}
                                    role='option'
                                >
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt=''
                                            className='ss-product-thumb'
                                            aria-hidden='true'
                                        />
                                    )}
                                    <div className='ss-product-info'>
                                        <span className='ss-product-name'>{item.name}</span>
                                        <span className='ss-product-price'>
                                            KES {Number(item.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No history or recent views */}
                    {history.length === 0 && recentViews.length === 0 && (
                        <div className='ss-empty'>
                            <FaSearch className='ss-empty-icon' aria-hidden='true' />
                            <p>Start typing to search products, categories, and brands.</p>
                        </div>
                    )}
                </>
            )}

            {/* ── Typing state ─────────────────────────────── */}
            {isTyping && (
                <>
                    {loading && (
                        <div className='ss-loading'>
                            <div className='ss-loading-dots'>
                                <span /><span /><span />
                            </div>
                            Searching...
                        </div>
                    )}

                    {!loading && !hasResults && (
                        <div className='ss-empty'>
                            <FaSearch className='ss-empty-icon' aria-hidden='true' />
                            <p>No results for <strong>"{keyword}"</strong></p>
                        </div>
                    )}

                    {/* Product suggestions */}
                    {suggestions.products.length > 0 && (
                        <div className='ss-section'>
                            <div className='ss-section-header'>
                                <FaStore className='ss-section-icon' aria-hidden='true' />
                                Products
                            </div>
                            {suggestions.products.map((p) => (
                                <button
                                    key={p._id}
                                    className='ss-row ss-row--product'
                                    onClick={() => onSelectProduct(p._id)}
                                    role='option'
                                >
                                    {p.image && (
                                        <img
                                            src={p.image}
                                            alt=''
                                            className='ss-product-thumb'
                                            aria-hidden='true'
                                        />
                                    )}
                                    <div className='ss-product-info'>
                                        <span className='ss-product-name'>{p.name}</span>
                                        <span className='ss-product-price'>
                                            KES {Number(p.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Category suggestions */}
                    {suggestions.categories.length > 0 && (
                        <div className='ss-section'>
                            <div className='ss-section-header'>
                                <FaTag className='ss-section-icon' aria-hidden='true' />
                                Categories
                            </div>
                            {suggestions.categories.map((cat) => (
                                <button
                                    key={cat}
                                    className='ss-row ss-row--category'
                                    onClick={() => onSelectCategory(cat)}
                                    role='option'
                                >
                                    <FaTag className='ss-row-icon' aria-hidden='true' />
                                    <span className='ss-row-text'>{cat}</span>
                                    <span className='ss-row-hint'>Browse category</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Brand suggestions */}
                    {suggestions.brands.length > 0 && (
                        <div className='ss-section'>
                            <div className='ss-section-header'>
                                <FaMobileAlt className='ss-section-icon' aria-hidden='true' />
                                Brands
                            </div>
                            {suggestions.brands.map((brand) => (
                                <button
                                    key={brand}
                                    className='ss-row ss-row--brand'
                                    onClick={() => onSelectBrand(brand)}
                                    role='option'
                                >
                                    <FaStore className='ss-row-icon' aria-hidden='true' />
                                    <span className='ss-row-text'>{brand}</span>
                                    <span className='ss-row-hint'>Browse brand</span>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

        </div>
    );
};

export default SearchSuggestions;