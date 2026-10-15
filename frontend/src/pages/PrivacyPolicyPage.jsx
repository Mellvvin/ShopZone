// frontend/src/pages/PrivacyPolicyPage.jsx
// Thin wrapper: renders the Privacy Policy via LegalDocument.
import LegalDocument from '../components/LegalDocument/LegalDocument';
import { PRIVACY_POLICY } from '../data/legalContent';

const PrivacyPolicyPage = () => <LegalDocument doc={PRIVACY_POLICY} />;

export default PrivacyPolicyPage;