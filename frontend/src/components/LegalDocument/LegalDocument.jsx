// frontend/src/components/LegalDocument/LegalDocument.jsx
// ─────────────────────────────────────────────────────────────
// Renders any legal document object from legalContent.js:
// an Oxford Blue hero strip, then readable titled sections.
// Working-page style (no animation). Pure display component.
// ─────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { SITE } from '../../data/siteConfig';
import './LegalDocument.css';

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
        <p className='legal-intro'>{doc.intro}</p>

        {doc.sections.map((section) => (
          <section key={section.heading} className='legal-section'>
            <h2 className='legal-section__heading'>{section.heading}</h2>
            {section.paragraphs.map((text) => (
              <p key={text} className='legal-section__text'>{text}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
};

export default LegalDocument;