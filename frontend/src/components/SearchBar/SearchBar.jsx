// src/components/SearchBar/SearchBar.jsx
// ─────────────────────────────────────────────────────────────
// Controlled search bar used in both desktop top bar
// and the mobile slide-down panel.
//
// Props:
//   keyword     {string}   — current input value (controlled)
//   setKeyword  {function} — updates keyword in parent state
//   onSubmit    {function} — called on form submit
//   onClear     {function} — called when × is clicked
//   placeholder {string}   — input placeholder text
//   autoFocus   {boolean}  — true for the mobile slide-down
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import './SearchBar.css';

const SearchBar = ({
    keyword,
    setKeyword,
    onSubmit,
    onClear,
    placeholder = 'Search products, categories and brands...',
    autoFocus = false,
}) => (
    <form className='searchbar-form' onSubmit={onSubmit}>

        {/* Search icon — left adornment */}
        <span className='searchbar-icon-left'>
            <FaSearch />
        </span>

        {/* Text input */}
        <input
            type='text'
            className='searchbar-input'
            placeholder={placeholder}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            autoFocus={autoFocus}
            aria-label='Search'
        />

        {/* Clear (×) button — only visible when input has text */}
        {keyword && (
            <button
                type='button'
                className='searchbar-clear-btn'
                onClick={onClear}
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
);

export default SearchBar;