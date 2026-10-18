// frontend/src/components/LegalDocument/LegalDocument.jsx
// ─────────────────────────────────────────────────────────────
// Renders any legal document object from legalContent.js:
//   - Oxford Blue hero strip
//   - Optional "draft" notice while SITE.isPlaceholder is true
//   - Clickable table of contents (anchor links per section)
//   - Sections with paragraphs and optional bulleted lists
//   - Links to the other legal pages at the bottom
// Working-page style (no animation). Pure display component.
// ─────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../../data/siteConfig';
import './LegalDocument.css';

// Turns a heading into a URL-safe anchor id, e.g.
// "Who is responsible for your data" -> "who-is-responsible-for-your-data"
const toSlug = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const LegalDocument = ({ doc }) => {
  // Set the browser tab title per document.
  useEffect(() => {
    document.title = `${doc.title} — ${SITE.name}`;
  }, [doc.title]);

  return (
    <div className='legal-page'>
      <div className='legal-hero'>
        <h1 className='legal-hero__title'>{doc.title}</h1>
        <p className='legal-hero__updated'>
          Last updated {SITE.legalLastUpdated}
        </p>
      </div>

      <div className='legal-body'>
        {/* Draft notice — hidden by setting SITE.isPlaceholder to false */}
        {SITE.isPlaceholder && (
          <div className='legal-notice' role='note'>
            <strong>Draft document.</strong> This text is a development
            placeholder and has not yet been reviewed by a legal practitioner.
          </div>
        )}

        <p className='legal-intro'>{doc.intro}</p>

        {/* Table of contents */}
        <nav className='legal-toc' aria-label='Contents'>
          <p className='legal-toc__title'>Contents</p>
          <ol className='legal-toc__list'>
            {doc.sections.map((section) => (
              <li key={section.heading}>
                <a href={`#${toSlug(section.heading)}`} className='legal-toc__link'>
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        {doc.sections.map((section, index) => (
          <section
            key={section.heading}
            id={toSlug(section.heading)}
            className='legal-section'
          >
            <h2 className='legal-section__heading'>
              {index + 1}. {section.heading}
            </h2>
            {section.paragraphs?.map((text) => (
              <p key={text} className='legal-section__text'>{text}</p>
            ))}
            {section.items && (
              <ul className='legal-section__list'>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* Cross-links to the other legal pages */}
        <div className='legal-related'>
          <Link to='/terms' className='legal-related__link'>Terms of Service</Link>
          <Link to='/privacy-policy' className='legal-related__link'>Privacy Policy</Link>
          <Link to='/cookie-policy' className='legal-related__link'>Cookie Policy</Link>
          <Link to='/returns-policy' className='legal-related__link'>Returns Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default LegalDocument;