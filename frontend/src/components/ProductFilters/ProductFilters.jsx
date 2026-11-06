// frontend/src/components/ProductFilters/ProductFilters.jsx
// ─────────────────────────────────────────────────────────────
// Sort dropdown + filter sheet for product listings (ISS-074).
//
// Everything lives in the URL (?sort=&minPrice=&maxPrice=&inStock=&onSale=)
// so filters survive refresh and can be shared. The page reads the same
// params and fetches. Other params (category, keyword, brand) are kept.
//
// Mobile: the filter panel is a bottom sheet. It sits above the bottom
// tab bar (z-index 1060) because it is a modal; page scroll is locked
// while open and always cleaned up on close/unmount.
//
// Props: count {number|null} — number of results to show, null hides it
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSlidersH, FaTimes } from 'react-icons/fa';
import './ProductFilters.css';

const SORT_OPTIONS = [
  { value: '',           label: 'Relevance / default' },
  { value: 'newest',     label: 'Newest first' },
  { value: 'price_asc',  label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating',     label: 'Top rated' },
  { value: 'name_asc',   label: 'Name: A to Z' },
];

const FILTER_KEYS = ['minPrice', 'maxPrice', 'inStock', 'onSale'];

const ProductFilters = ({ count = null }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);

  // Draft values edited inside the sheet; only applied on "Apply"
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStock, setInStock]   = useState(false);
  const [onSale, setOnSale]     = useState(false);
  const [error, setError]       = useState('');

  const sort = searchParams.get('sort') || '';
  const activeCount = FILTER_KEYS.filter((k) => searchParams.get(k)).length;

  // Open the sheet with the draft matching what is currently applied
  const openSheet = () => {
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setInStock(searchParams.get('inStock') === 'true');
    setOnSale(searchParams.get('onSale') === 'true');
    setError('');
    setOpen(true);
  };

  // Scroll lock on html + body while the sheet is open (always cleaned up)
  useEffect(() => {
    if (!open) return undefined;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Write one param, removing it when empty. Keeps every other param.
  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === '' || value === false || value == null) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  const handleSort = (e) => updateParams({ sort: e.target.value });

  const applyFilters = () => {
    const min = minPrice === '' ? null : Number(minPrice);
    const max = maxPrice === '' ? null : Number(maxPrice);
    if ((min !== null && (!Number.isFinite(min) || min < 0)) ||
        (max !== null && (!Number.isFinite(max) || max <= 0))) {
      setError('Enter valid prices (numbers only).');
      return;
    }
    if (min !== null && max !== null && min > max) {
      setError('Minimum price cannot be higher than maximum.');
      return;
    }
    updateParams({
      minPrice: min === null ? '' : min,
      maxPrice: max === null ? '' : max,
      inStock:  inStock ? 'true' : '',
      onSale:   onSale ? 'true' : '',
    });
    setOpen(false);
  };

  const clearFilters = () => {
    updateParams({ minPrice: '', maxPrice: '', inStock: '', onSale: '' });
    setOpen(false);
  };

  return (
    <>
      <div className='pf-bar'>
        {count !== null && (
          <span className='pf-count'>
            {count} {count === 1 ? 'product' : 'products'}
          </span>
        )}
        <div className='pf-controls'>
          <label className='pf-sort'>
            <span className='pf-sort__label'>Sort</span>
            <select value={sort} onChange={handleSort} aria-label='Sort products'>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <button type='button' className='pf-filter-btn' onClick={openSheet}>
            <FaSlidersH aria-hidden='true' /> Filters
            {activeCount > 0 && <span className='pf-filter-btn__badge'>{activeCount}</span>}
          </button>
        </div>
      </div>

      {open && (
        <>
          <div className='pf-backdrop' onClick={() => setOpen(false)} aria-hidden='true' />
          <div className='pf-sheet' role='dialog' aria-modal='true' aria-label='Filter products'>
            <div className='pf-sheet__head'>
              <h2 className='pf-sheet__title'>Filters</h2>
              <button type='button' className='pf-sheet__close' onClick={() => setOpen(false)} aria-label='Close filters'>
                <FaTimes />
              </button>
            </div>

            <div className='pf-sheet__body'>
              <p className='pf-group-title'>Price (KES)</p>
              <div className='pf-price-row'>
                <input
                  type='number' inputMode='numeric' min='0' placeholder='Min'
                  value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                  aria-label='Minimum price'
                />
                <span aria-hidden='true'>to</span>
                <input
                  type='number' inputMode='numeric' min='0' placeholder='Max'
                  value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  aria-label='Maximum price'
                />
              </div>

              <p className='pf-group-title'>Availability</p>
              <label className='pf-check'>
                <input type='checkbox' checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
                <span>In stock only</span>
              </label>
              <label className='pf-check'>
                <input type='checkbox' checked={onSale} onChange={(e) => setOnSale(e.target.checked)} />
                <span>On sale only</span>
              </label>

              {error && <p className='pf-error' role='alert'>{error}</p>}
            </div>

            <div className='pf-sheet__foot'>
              <button type='button' className='pf-btn pf-btn--ghost' onClick={clearFilters}>Clear all</button>
              <button type='button' className='pf-btn pf-btn--primary' onClick={applyFilters}>Apply</button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProductFilters;