// frontend/src/pages/CookiePolicyPage.jsx
// Thin wrapper: renders the Cookie Policy via LegalDocument.
import LegalDocument from '../components/LegalDocument/LegalDocument';
import { COOKIE_POLICY } from '../data/legalContent';

const CookiePolicyPage = () => <LegalDocument doc={COOKIE_POLICY} />;

export default CookiePolicyPage;