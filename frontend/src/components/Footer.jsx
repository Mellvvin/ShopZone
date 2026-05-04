import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Facebook',
      url:  'https://facebook.com',
      icon: (
        <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'
          fill='currentColor' viewBox='0 0 16 16'>
          <path d='M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z'/>
        </svg>
      ),
    },
    {
      name: 'Instagram',
      url:  'https://instagram.com',
      icon: (
        <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'
          fill='currentColor' viewBox='0 0 16 16'>
          <path d='M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z'/>
        </svg>
      ),
    },
    {
      name: 'Twitter',
      url:  'https://twitter.com',
      icon: (
        <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'
          fill='currentColor' viewBox='0 0 16 16'>
          <path d='M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z'/>
        </svg>
      ),
    },
    {
      name: 'TikTok',
      url:  'https://tiktok.com',
      icon: (
        <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'
          fill='currentColor' viewBox='0 0 16 16'>
          <path d='M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3V0z'/>
        </svg>
      ),
    },
    {
      name: 'WhatsApp',
      url:  'https://wa.me/254700000000',
      icon: (
        <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'
          fill='currentColor' viewBox='0 0 16 16'>
          <path d='M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z'/>
        </svg>
      ),
    },
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
            <h4 style={{
              color:         'var(--tan)',
              fontWeight:    '700',
              fontSize:      '1.4rem',
              letterSpacing: '1px',
              marginBottom:  '0.75rem',
            }}>
              ShopZone
            </h4>
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
                {
                  icon: '📍',
                  text: 'Nairobi, Kenya',
                },
                {
                  icon: '📞',
                  text: '+254 700 000 000',
                  href: 'tel:+254700000000',
                },
                {
                  icon: '📧',
                  text: 'support@shopzone.com',
                  href: 'mailto:support@shopzone.com',
                },
                {
                  icon: '🕐',
                  text: 'Mon–Fri, 8am–6pm EAT',
                },
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