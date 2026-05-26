// src/components/Footer/Footer.jsx
// ─────────────────────────────────────────────────────────────
// Footer component — structure and logic only.
// All styling lives in Footer.css.
// ─────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import {
  FaFacebook, FaInstagram, FaTwitter,
  FaTiktok, FaWhatsapp, FaEnvelope,
  FaMapMarkerAlt, FaPhone, FaClock
} from 'react-icons/fa';
import ShopZoneLogo from '../ShopZoneLogo/ShopZoneLogo';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // ── Social links ───────────────────────────────────────────
  const socialLinks = [
    { name: 'Facebook', url: 'https://facebook.com', icon: <FaFacebook size={18} /> },
    { name: 'Instagram', url: 'https://instagram.com', icon: <FaInstagram size={18} /> },
    { name: 'Twitter', url: 'https://twitter.com', icon: <FaTwitter size={18} /> },
    { name: 'TikTok', url: 'https://tiktok.com', icon: <FaTiktok size={18} /> },
    { name: 'WhatsApp', url: 'https://wa.me/254700000000', icon: <FaWhatsapp size={18} /> },
  ];

  return (
    <footer className='footer-wrapper'>

      {/* ── Main Footer Content ── */}
      <Container className='footer-main'>
        <Row>

          {/* ── Column 1 — Brand ── */}
          <Col lg={4} md={6} className='mb-4'>
            <ShopZoneLogo size='medium' dark={true} />
            <p className='footer-tagline'>
              Connecting retailers and small businesses to structured,
              reliable supply chains. Quality wholesale products delivered
              to your door.
            </p>

            {/* Social Icons */}
            <div className='d-flex gap-3 flex-wrap'>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  title={social.name}
                  className='footer-social-icon'
                >
                  {social.icon}
                </a>
              ))}
            </div>
        </Col>

        {/* ── Column 2 — Quick Links ── */}
        <Col lg={2} md={6} sm={6} className='mb-4'>
            {/* Changed from h6 to p — footer labels are not part of page heading outline */}
            <p className='footer-col-heading'>Quick Links</p>
          <ul className='footer-link-list'>
            {[
              { label: 'Home', to: '/' },
              { label: 'My Profile', to: '/profile' },
              { label: 'My Orders', to: '/profile' },
              { label: 'Become a Seller', to: '/' },
              { label: 'FAQ', to: '/' },
            ].map((link) => (
              <li key={link.label}>
                <Link to={link.to} className='footer-link'>
                  › {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Col>

        {/* ── Column 3 — Categories ── */}
        <Col lg={2} md={6} sm={6} className='mb-4'>
            {/* Changed from h6 to p — footer labels are not part of page heading outline */}
            <p className='footer-col-heading'>Categories</p>
          <ul className='footer-link-list'>
            {[
                'Electronics',
                'Fashion & Apparel',
                'Home & Kitchen',
                'Food & Grocery',
                'Beauty & Personal Care',
                'Hardware & Tools',
            ].map((cat) => (
              <li key={cat}>
                <span className='footer-link footer-link--span'>
                  › {cat}
                </span>
              </li>
            ))}
          </ul>
        </Col>

        {/* ── Column 4 — Contact ── */}
        <Col lg={4} md={6} className='mb-4'>
            {/* Changed from h6 to p — footer labels are not part of page heading outline */}
            <p className='footer-col-heading'>Contact Us</p>
          <ul className='footer-contact-list'>
            {[
              { icon: <FaMapMarkerAlt size={14} />, text: 'Nairobi, Kenya' },
              { icon: <FaPhone size={14} />, text: '+254 700 000 000', href: 'tel:+254700000000' },
              { icon: <FaEnvelope size={14} />, text: 'support@shopzone.com', href: 'mailto:support@shopzone.com' },
              { icon: <FaClock size={14} />, text: 'Mon–Fri, 8am–6pm EAT' },
            ].map((item, index) => (
              <li key={index} className='footer-contact-item'>
                {/* Icon */}
                <span className='footer-contact-icon'>{item.icon}</span>
                {/* Text — link if href provided, plain span otherwise */}
                {item.href ? (
                  <a href={item.href} className='footer-link'>
                    {item.text}
                  </a>
                ) : (
                  <span className='footer-contact-text'>{item.text}</span>
                )}
              </li>
            ))}
          </ul>
        </Col>

      </Row>
    </Container>

      {/* ── Divider ── */ }
  <div className='footer-divider' />

  {/* ── Bottom Bar ── */ }
  <Container className='footer-bottom'>
    <Row className='align-items-center'>

      {/* Copyright */}
      <Col md={6} className='text-center text-md-start mb-2 mb-md-0'>
        <p className='footer-copyright'>
          © {currentYear} ShopZone Wholesale. All rights reserved.
        </p>
      </Col>

      {/* Legal links */}
      <Col md={6} className='text-center text-md-end'>
        <span className='footer-legal'>
          <span className='footer-legal-link'>Terms of Service</span>
          ·
          <span className='footer-legal-link'>Privacy Policy</span>
          ·
          <span className='footer-legal-link'>Cookie Policy</span>
        </span>
      </Col>

    </Row>
  </Container>

    </footer >
  );
};

export default Footer;