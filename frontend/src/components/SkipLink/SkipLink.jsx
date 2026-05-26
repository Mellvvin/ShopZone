// src/components/SkipLink/SkipLink.jsx
// ─────────────────────────────────────────────────────────────
// Visually hidden link that appears on keyboard focus.
// Allows keyboard users to skip the header and jump directly
// to the main content area. WCAG 2.4.1 requirement.
// Target is id="main-content" on the <main> tag in App.jsx.
// ─────────────────────────────────────────────────────────────
import './SkipLink.css';

const SkipLink = () => {
    return (
        <a href='#main-content' className='skip-link'>
            Skip to main content
        </a>
    );
};

export default SkipLink;