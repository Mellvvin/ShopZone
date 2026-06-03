// src/components/SearchBar/SearchBar.jsx
// ─────────────────────────────────────────────────────────────
// Controlled search bar with autocomplete dropdown.
//
// Features:
//   - Debounced API call to /api/products for live suggestions
//   - Category and brand matching from static lists
//   - Search history stored in localStorage (last 8 searches)
//   - Recent views stored in localStorage (last 4 products)
//   - Popular searches shown when input is empty
//   - Keyboard navigation: Escape closes dropdown
//
// localStorage keys:
//   shopzone_search_history  — string[]
//   shopzone_recent_views    — { id, name, image, price }[]
//
// Props:
//   keyword     — controlled input value
//   setKeyword  — updates keyword in parent
//   onSubmit    — called on form submit
//   onClear     — called when × clicked
//   placeholder — input placeholder
//   autoFocus   — true for mobile slide-down
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import SearchSuggestions from './SearchSuggestions';
import './SearchBar.css';

// ── All categories — must match MongoDB exactly ───────────────
const ALL_CATEGORIES = [
    'Electronics', 'Fashion & Apparel', 'Fabric & Textiles',
    'Home & Kitchen', 'Food & Grocery', 'Beauty & Personal Care',
    'Hardware & Tools', 'Office & Stationery', 'Agriculture & Garden',
    'Baby & Kids', 'Sports & Outdoors', 'Health & Wellness',
    'General Merchandise',
];

const HISTORY_KEY      = 'shopzone_search_history';
const RECENT_VIEWS_KEY = 'shopzone_recent_views';
const MAX_HISTORY      = 8;
const MAX_RECENT_VIEWS = 4;
const DEBOUNCE_MS      = 280;

// ── localStorage helpers ──────────────────────────────────────
const readHistory = () => {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
        return [];
    }
};

const writeHistory = (terms) => {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(terms));
    } catch {}
};

const readRecentViews = () => {
    try {
        return JSON.parse(localStorage.getItem(RECENT_VIEWS_KEY) || '[]');
    } catch {
        return [];
    }
};

// ── Public helper — called from ProductPage when a product is viewed ──
// Exported so ProductPage can call it on mount without knowing
// about the SearchBar internals.
export const recordRecentView = (product) => {
    if (!product?._id) return;
    try {
        const current = readRecentViews();
        const filtered = current.filter((v) => v.id !== product._id);
        const updated = [
            { id: product._id, name: product.name, image: product.image, price: product.price },
            ...filtered,
        ].slice(0, MAX_RECENT_VIEWS);
        localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(updated));
    } catch {}
};

const SearchBar = ({
    keyword,
    setKeyword,
    onSubmit,
    onClear,
    placeholder = 'Search products, categories and brands...',
    autoFocus = false,
}) => {
    const navigate   = useNavigate();
    const inputRef   = useRef(null);
    const wrapperRef = useRef(null);

    // ── Dropdown state ────────────────────────────────────────
    const [dropdownOpen, setDropdownOpen]   = useState(false);
    const [suggestions, setSuggestions]     = useState({ products: [], categories: [], brands: [] });
    const [loadingSugg, setLoadingSugg]     = useState(false);
    const [history, setHistory]             = useState([]);
    const [recentViews, setRecentViews]     = useState([]);

    const debounceTimer = useRef(null);

    // ── Load localStorage on mount ────────────────────────────
    useEffect(() => {
        setHistory(readHistory());
        setRecentViews(readRecentViews());
    }, []);

    // ── Close dropdown on outside click ──────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Escape key closes dropdown ────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') setDropdownOpen(false);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // ── Debounced API call when keyword changes ───────────────
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        const q = keyword.trim();

        if (!q) {
            setSuggestions({ products: [], categories: [], brands: [] });
            setLoadingSugg(false);
            return;
        }

        setLoadingSugg(true);
        debounceTimer.current = setTimeout(async () => {
            try {
                const { data } = await axios.get(
                    `/api/products?keyword=${encodeURIComponent(q)}&limit=5`
                );
                // data may be an array or { products: [] } depending on backend
                const products = Array.isArray(data)
                    ? data.slice(0, 5)
                    : (data.products || []).slice(0, 5);

                // Category matches — client-side filter of static list
                const categories = ALL_CATEGORIES.filter((c) =>
                    c.toLowerCase().includes(q.toLowerCase())
                ).slice(0, 3);

                // Brand matches — pull from API brands endpoint
                let brands = [];
                try {
                    const { data: brandData } = await axios.get('/api/products/brands');
                    brands = (brandData || [])
                        .filter((b) => b.brand && b.brand.toLowerCase().includes(q.toLowerCase()))
                        .map((b) => b.brand)
                        .slice(0, 3);
                } catch {}

                setSuggestions({ products, categories, brands });
            } catch {
                setSuggestions({ products: [], categories: [], brands: [] });
            } finally {
                setLoadingSugg(false);
            }
        }, DEBOUNCE_MS);

        return () => clearTimeout(debounceTimer.current);
    }, [keyword]);

    // ── Save search to history ────────────────────────────────
    const saveToHistory = useCallback((term) => {
        const trimmed = term.trim();
        if (!trimmed) return;
        const current = readHistory();
        const updated = [trimmed, ...current.filter((t) => t !== trimmed)].slice(0, MAX_HISTORY);
        writeHistory(updated);
        setHistory(updated);
    }, []);

    // ── Handlers ──────────────────────────────────────────────
    const handleFocus = () => {
        setHistory(readHistory());
        setRecentViews(readRecentViews());
        setDropdownOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const q = keyword.trim();
        if (q) saveToHistory(q);
        setDropdownOpen(false);
        onSubmit(e);
    };

    const handleClear = () => {
        setDropdownOpen(false);
        onClear();
    };

    const handleSelectSuggestion = (term) => {
        setKeyword(term);
        saveToHistory(term);
        setDropdownOpen(false);
        navigate(`/?keyword=${encodeURIComponent(term)}`);
    };

    const handleSelectHistory = (term) => {
        setKeyword(term);
        setDropdownOpen(false);
        navigate(`/?keyword=${encodeURIComponent(term)}`);
    };

    const handleSelectCategory = (cat) => {
        setKeyword('');
        setDropdownOpen(false);
        navigate(`/?category=${encodeURIComponent(cat)}`);
    };

    const handleSelectBrand = (brand) => {
        setKeyword('');
        setDropdownOpen(false);
        navigate(`/?brand=${encodeURIComponent(brand)}`);
    };

    const handleSelectProduct = (id) => {
        setKeyword('');
        setDropdownOpen(false);
        navigate(`/product/${id}`);
    };

    const handleClearHistory = () => {
        writeHistory([]);
        setHistory([]);
    };

    return (
        <div className='searchbar-wrapper' ref={wrapperRef}>
            <form className='searchbar-form' onSubmit={handleSubmit}>

                {/* Search icon left adornment */}
                <span className='searchbar-icon-left' aria-hidden='true'>
                    <FaSearch />
                </span>

                {/* Text input */}
                <input
                    ref={inputRef}
                    type='text'
                    className='searchbar-input'
                    placeholder={placeholder}
                    value={keyword}
                    onChange={(e) => {
                        setKeyword(e.target.value);
                        setDropdownOpen(true);
                    }}
                    onFocus={handleFocus}
                    autoFocus={autoFocus}
                    aria-label='Search'
                    aria-autocomplete='list'
                    aria-expanded={dropdownOpen}
                    autoComplete='off'
                />

                {/* Clear button */}
                {keyword && (
                    <button
                        type='button'
                        className='searchbar-clear-btn'
                        onClick={handleClear}
                        aria-label='Clear search'
                    >
                        <FaTimes size={12} />
                    </button>
                )}

                {/* Submit button */}
                <button type='submit' className='searchbar-submit-btn'>
                    Search
                </button>

            </form>

            {/* Autocomplete dropdown */}
            <SearchSuggestions
                keyword={keyword}
                suggestions={suggestions}
                history={history}
                recentViews={recentViews}
                loading={loadingSugg}
                onSelectSuggestion={handleSelectSuggestion}
                onSelectHistory={handleSelectHistory}
                onSelectCategory={handleSelectCategory}
                onSelectBrand={handleSelectBrand}
                onSelectProduct={handleSelectProduct}
                onClearHistory={handleClearHistory}
                visible={dropdownOpen}
            />
        </div>
    );
};

export default SearchBar;