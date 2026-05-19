// CategoryCards.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Grid of all 13 product categories. Clicking a card navigates to the homepage
// filtered by that category (/?category=...).
//
// Each card shows:
//   • A relevant react-icons/fa icon in the Oxford Blue / Tan colour scheme
//   • The category name
//   • A subtle arrow that appears on hover
//
// Category strings must match MongoDB exactly — same list as CategoryBar and
// the Footer.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaMobileAlt,       // Electronics
  FaTshirt,          // Fashion & Apparel
  FaCut,             // Fabric & Textiles
  FaUtensils,        // Home & Kitchen
  FaShoppingBasket,  // Food & Grocery
  FaSpa,             // Beauty & Personal Care
  FaHammer,          // Hardware & Tools
  FaPen,             // Office & Stationery
  FaLeaf,            // Agriculture & Garden
  FaBaby,            // Baby & Kids
  FaRunning,         // Sports & Outdoors
  FaHeartbeat,       // Health & Wellness
  FaBoxOpen,         // General Merchandise
  FaChevronRight,    // hover arrow indicator
} from 'react-icons/fa';
import './CategoryCards.css';

// ── Category data ─────────────────────────────────────────────────────────
// Each entry maps to a MongoDB category string and gets an icon + accent colour.
// The accent colour is a lighter overlay tint used on card hover — these are
// all derived from the Oxford Blue / Tan palette to stay on-brand.
const CATEGORIES = [
  {
    label: 'Electronics',
    icon: FaMobileAlt,
    accent: '#002147',   // Oxford Blue
  },
  {
    label: 'Fashion & Apparel',
    icon: FaTshirt,
    accent: '#003366',
  },
  {
    label: 'Fabric & Textiles',
    icon: FaCut,
    accent: '#004080',
  },
  {
    label: 'Home & Kitchen',
    icon: FaUtensils,
    accent: '#002147',
  },
  {
    label: 'Food & Grocery',
    icon: FaShoppingBasket,
    accent: '#003366',
  },
  {
    label: 'Beauty & Personal Care',
    icon: FaSpa,
    accent: '#004080',
  },
  {
    label: 'Hardware & Tools',
    icon: FaHammer,
    accent: '#002147',
  },
  {
    label: 'Office & Stationery',
    icon: FaPen,
    accent: '#003366',
  },
  {
    label: 'Agriculture & Garden',
    icon: FaLeaf,
    accent: '#004080',
  },
  {
    label: 'Baby & Kids',
    icon: FaBaby,
    accent: '#002147',
  },
  {
    label: 'Sports & Outdoors',
    icon: FaRunning,
    accent: '#003366',
  },
  {
    label: 'Health & Wellness',
    icon: FaHeartbeat,
    accent: '#004080',
  },
  {
    label: 'General Merchandise',
    icon: FaBoxOpen,
    accent: '#002147',
  },
];

const CategoryCards = () => {
  const navigate = useNavigate();

  // Navigate to homepage with the selected category as a query param
  const handleCategoryClick = (categoryLabel) => {
    navigate(`/?category=${encodeURIComponent(categoryLabel)}`);
  };

  return (
    <section className='category-cards-section' aria-labelledby='category-cards-heading'>

      {/* ── Section header ────────────────────────────────────────────────── */}
      <div className='section-header'>
        <h2 className='section-title' id='category-cards-heading'>
          Browse by Category
        </h2>
        <p className='section-subtitle'>
          Explore our full range of wholesale categories
        </p>
      </div>

      {/* ── Category grid ─────────────────────────────────────────────────── */}
      {/* CSS grid — fills up to 7 columns on wide screens, wraps gracefully */}
      <div className='category-cards-grid'>
        {CATEGORIES.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className='category-card'
            onClick={() => handleCategoryClick(label)}
            aria-label={`Browse ${label}`}
          >
            {/* Icon container */}
            <div className='category-card__icon-wrap' aria-hidden='true'>
              <Icon className='category-card__icon' />
            </div>

            {/* Label */}
            <span className='category-card__label'>{label}</span>

            {/* Hover arrow — visible only on hover via CSS */}
            <FaChevronRight
              className='category-card__arrow'
              aria-hidden='true'
            />
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryCards;
