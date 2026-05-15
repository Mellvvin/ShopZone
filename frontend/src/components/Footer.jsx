import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import {
  FaFacebook, FaInstagram, FaTwitter,
  FaTiktok, FaWhatsapp, FaEnvelope,
  FaMapMarkerAlt, FaPhone, FaClock
} from 'react-icons/fa';
import ShopZoneLogo from './ShopZoneLogo';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  {/* social links */ }
  const socialLinks = [
    { name: 'Facebook', url: 'https://facebook.com', icon: <FaFacebook size={18} /> },
    { name: 'Instagram', url: 'https://instagram.com', icon: <FaInstagram size={18} /> },
    { name: 'Twitter', url: 'https://twitter.com', icon: <FaTwitter size={18} /> },
    { name: 'TikTok', url: 'https://tiktok.com', icon: <FaTiktok size={18} /> },
    { name: 'WhatsApp', url: 'https://wa.me/254700000000', icon: <FaWhatsapp size={18} /> },
  ];

  return (
    <footer style={{
      backgroundColor: 'var(--oxford-blue)',
      color:           'var(--tan)',
      marginTop:       'auto',
    }}>

      {/* ── Main Footer Content ── */}
      <Container style={{ padding: '3rem 1rem 2rem' }}>
        <Row>

          {/* ── Column 1 — Brand ── */}
          <Col lg={4} md={6} className='mb-4'>
            <ShopZoneLogo size="medium" dark={true} />
            <p style={{
              color:        'rgba(210,180,140,0.7)',
              fontSize:     '0.88rem',
              lineHeight:   '1.7',
              marginBottom: '1.2rem',
              maxWidth:     '280px',
            }}>
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
                  style={{
                    color:           'var(--tan)',
                    backgroundColor: 'rgba(210,180,140,0.1)',
                    border:          '1px solid rgba(210,180,140,0.2)',
                    borderRadius:    '8px',
                    width:           '38px',
                    height:          '38px',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    transition:      'all 0.2s ease',
                    textDecoration:  'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(210,180,140,0.25)';
                    e.currentTarget.style.borderColor     = 'var(--tan)';
                    e.currentTarget.style.transform       = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(210,180,140,0.1)';
                    e.currentTarget.style.borderColor     = 'rgba(210,180,140,0.2)';
                    e.currentTarget.style.transform       = 'translateY(0)';
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </Col>

          {/* ── Column 2 — Quick Links ── */}
          <Col lg={2} md={6} sm={6} className='mb-4'>
            <h6 style={{
              color:          'var(--tan)',
              fontWeight:     '700',
              textTransform:  'uppercase',
              letterSpacing:  '1px',
              fontSize:       '0.78rem',
              marginBottom:   '1rem',
              paddingBottom:  '0.5rem',
              borderBottom:   '2px solid rgba(210,180,140,0.2)',
            }}>
              Quick Links
            </h6>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Home',            to: '/' },
                { label: 'My Profile',      to: '/profile' },
                { label: 'My Orders',       to: '/profile' },
                { label: 'Become a Seller', to: '/' },
                { label: 'FAQ',             to: '/' },
              ].map((link) => (
                <li key={link.label} style={{ marginBottom: '0.5rem' }}>
                  <Link
                    to={link.to}
                    style={{
                      color:          'rgba(210,180,140,0.7)',
                      textDecoration: 'none',
                      fontSize:       '0.875rem',
                      transition:     'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--tan)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(210,180,140,0.7)';
                    }}
                  >
                    › {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* ── Column 3 — Categories ── */}
          <Col lg={2} md={6} sm={6} className='mb-4'>
            <h6 style={{
              color:          'var(--tan)',
              fontWeight:     '700',
              textTransform:  'uppercase',
              letterSpacing:  '1px',
              fontSize:       '0.78rem',
              marginBottom:   '1rem',
              paddingBottom:  '0.5rem',
              borderBottom:   '2px solid rgba(210,180,140,0.2)',
            }}>
              Categories
            </h6>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Electronics',
                'Fashion',
                'Home & Kitchen',
                'Office Supplies',
                'Food & Beverage',
                'Beauty',
                'Hardware',
              ].map((cat) => (
                <li key={cat} style={{ marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      color:          'rgba(210,180,140,0.7)',
                      fontSize:       '0.875rem',
                      cursor:         'pointer',
                      transition:     'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--tan)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(210,180,140,0.7)';
                    }}
                  >
                    › {cat}
                  </span>
                </li>
              ))}
            </ul>
          </Col>

          {/* ── Column 4 — Contact ── */}
          <Col lg={4} md={6} className='mb-4'>
            <h6 style={{
              color:          'var(--tan)',
              fontWeight:     '700',
              textTransform:  'uppercase',
              letterSpacing:  '1px',
              fontSize:       '0.78rem',
              marginBottom:   '1rem',
              paddingBottom:  '0.5rem',
              borderBottom:   '2px solid rgba(210,180,140,0.2)',
            }}>
              Contact Us
            </h6>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { icon: <FaMapMarkerAlt size={14} />, text: 'Nairobi, Kenya' },
                { icon: <FaPhone size={14} />, text: '+254 700 000 000', href: 'tel:+254700000000' },
                { icon: <FaEnvelope size={14} />, text: 'support@shopzone.com', href: 'mailto:support@shopzone.com' },
                { icon: <FaClock size={14} />, text: 'Mon–Fri, 8am–6pm EAT' },
              ].map((item, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: '0.75rem',
                    display:      'flex',
                    alignItems:   'flex-start',
                    gap:          '0.6rem',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', marginTop: '1px' }}>
                    {item.icon}
                  </span>
                  {item.href ? (
                    <a
                      href={item.href}
                      style={{
                        color:          'rgba(210,180,140,0.7)',
                        textDecoration: 'none',
                        fontSize:       '0.875rem',
                        transition:     'color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--tan)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(210,180,140,0.7)';
                      }}
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span style={{
                      color:    'rgba(210,180,140,0.7)',
                      fontSize: '0.875rem',
                    }}>
                      {item.text}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Col>
        </Row>
      </Container>

      {/* ── Divider ── */}
      <div style={{
        borderTop: '1px solid rgba(210,180,140,0.15)',
      }} />

      {/* ── Bottom Bar ── */}
      <Container style={{ padding: '1rem' }}>
        <Row className='align-items-center'>
          <Col md={6} className='text-center text-md-start mb-2 mb-md-0'>
            <p style={{
              margin:   0,
              color:    'rgba(210,180,140,0.5)',
              fontSize: '0.8rem',
            }}>
              © {currentYear} ShopZone Wholesale. All rights reserved.
            </p>
          </Col>
          <Col md={6} className='text-center text-md-end'>
            <span style={{
              color:    'rgba(210,180,140,0.5)',
              fontSize: '0.8rem',
            }}>
              <span style={{ margin: '0 0.5rem', cursor: 'pointer' }}>
                Terms of Service
              </span>
              ·
              <span style={{ margin: '0 0.5rem', cursor: 'pointer' }}>
                Privacy Policy
              </span>
              ·
              <span style={{ margin: '0 0.5rem', cursor: 'pointer' }}>
                Cookie Policy
              </span>
            </span>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;