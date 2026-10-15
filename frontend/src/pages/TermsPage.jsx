// frontend/src/pages/TermsPage.jsx
// Thin wrapper: renders the Terms of Service via LegalDocument.
import LegalDocument from '../components/LegalDocument/LegalDocument';
import { TERMS_OF_SERVICE } from '../data/legalContent';

const TermsPage = () => <LegalDocument doc={TERMS_OF_SERVICE} />;

export default TermsPage;