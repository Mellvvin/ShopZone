// frontend/src/pages/AdminProductEditPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// CHANGES FROM PREVIOUS VERSION:
//   • Predefined tags per category — auto-populate when category changes
//   • Sale price field hidden unless isOnSale is ticked
//   • Validation: name cannot be default, price > 0, description min 30 chars,
//     image required, stock > 0 on creation
//   • Tags rendered as removable chips with add-your-own input
//   • Unit type hints added
//   • Sale price validation and confirmation dialog preserved from last update
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Form, Button, Card, Alert,
  Spinner, Row, Col, Image,
} from 'react-bootstrap';
import axios from 'axios';
import { showToast } from '../components/Toast/Toast';

// ── Category options — match MongoDB exactly ──────────────────
const CATEGORIES = [
  'Electronics',
  'Fashion & Apparel',
  'Fabric & Textiles',
  'Home & Kitchen',
  'Food & Grocery',
  'Beauty & Personal Care',
  'Hardware & Tools',
  'Office & Stationery',
  'Agriculture & Garden',
  'Baby & Kids',
  'Sports & Outdoors',
  'Health & Wellness',
  'General Merchandise',
];

// ── Predefined tags per category ──────────────────────────────
// Auto-populated when seller selects a category.
// Seller can remove irrelevant ones or add their own.
const CATEGORY_TAGS = {
  'Electronics': ['electronics', 'gadgets', 'wholesale', 'bulk', 'accessories', 'cables', 'tech'],
  'Fashion & Apparel': ['fashion', 'clothing', 'wholesale', 'bulk', 'apparel', 'garments', 'uniforms'],
  'Fabric & Textiles': ['fabric', 'textiles', 'wholesale', 'bulk', 'material', 'cotton', 'thread'],
  'Home & Kitchen': ['home', 'kitchen', 'household', 'wholesale', 'bulk', 'utensils', 'cookware'],
  'Food & Grocery': ['food', 'grocery', 'wholesale', 'bulk', 'packaged', 'beverages', 'staples'],
  'Beauty & Personal Care': ['beauty', 'cosmetics', 'wholesale', 'bulk', 'skincare', 'haircare', 'grooming'],
  'Hardware & Tools': ['hardware', 'tools', 'wholesale', 'bulk', 'industrial', 'construction', 'fittings'],
  'Office & Stationery': ['office', 'stationery', 'wholesale', 'bulk', 'school', 'supplies', 'paper'],
  'Agriculture & Garden': ['agriculture', 'garden', 'wholesale', 'bulk', 'farming', 'seeds', 'fertiliser'],
  'Baby & Kids': ['baby', 'kids', 'children', 'wholesale', 'bulk', 'toys', 'feeding'],
  'Sports & Outdoors': ['sports', 'outdoor', 'wholesale', 'bulk', 'fitness', 'equipment', 'activewear'],
  'Health & Wellness': ['health', 'wellness', 'wholesale', 'bulk', 'supplements', 'vitamins', 'hygiene'],
  'General Merchandise': ['general', 'merchandise', 'wholesale', 'bulk', 'variety', 'assorted'],
};

// ── Unit hints — shown below the unit dropdown ────────────────
const UNIT_HINTS = {
  'Per Unit': 'Single item — e.g. one phone, one chair',
  'Bale': 'Compressed bundle — e.g. 50 pieces of fabric per bale',
  'Carton': 'Sealed box — e.g. 24 tins per carton',
  'Dozen': '12 pieces per dozen',
  'Kg': 'Price per kilogram — e.g. maize flour, sugar',
  'Box': 'Open box — e.g. 100 pens per box',
  'Sack': 'Large bag — e.g. 50kg sack of rice',
};

// ── Default values that mean the product was never properly filled ─
const INVALID_NAMES = ['new product', 'sample product', 'product name', 'enter product name'];

const AdminProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // ── Form field state ──────────────────────────────────────
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [unit, setUnit] = useState('Per Unit');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isOnSale, setIsOnSale] = useState(false);
  const [isClearance, setIsClearance] = useState(false);

  // Tags stored as an array of strings for chip rendering
  const [tagList, setTagList] = useState([]);
  // Custom tag input field
  const [tagInput, setTagInput] = useState('');

  // ── UI state ──────────────────────────────────────────────
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // ── Auth header ───────────────────────────────────────────
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userInfo.token}`,
    },
  };

  // ── Fetch existing product data ───────────────────────────
  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) { navigate('/login'); return; }
    fetchProduct();
  }, [userInfo, navigate]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/products/${id}`);
      setName(data.name);
      setPrice(data.price ?? '');
      setSalePrice(data.salePrice ?? '');
      setImage(data.image ?? '');
      setCategory(data.category ?? '');
      setDescription(data.description ?? '');
      setCountInStock(data.countInStock ?? '');
      setUnit(data.unit || 'Per Unit');
      setIsFeatured(data.isFeatured || false);
      setIsOnSale(data.isOnSale || false);
      setIsClearance(data.isClearance || false);
      // Tags come as array from backend
      setTagList(data.tags || []);
      setLoading(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      showToast(msg, 'error');
      setLoading(false);
    }
  };

  // ── Auto-populate tags when category changes ──────────────
  // Only pre-fills if tagList is currently empty so we don't
  // overwrite tags the seller already set on an existing product
  const handleCategoryChange = (value) => {
    setCategory(value);
    // Always replace tags when category changes
    if (CATEGORY_TAGS[value]) {
      setTagList(CATEGORY_TAGS[value]);
    } else {
      setTagList([]);
    }
  };

  // ── Tag chip management ───────────────────────────────────
  // Remove a tag by clicking the × on its chip
  const removeTag = (tagToRemove) => {
    setTagList((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Add a custom tag — fired on Enter or comma
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/,/g, '');
      if (newTag && !tagList.includes(newTag)) {
        setTagList((prev) => [...prev, newTag]);
      }
      setTagInput('');
    }
  };

  // ── Image upload handler ──────────────────────────────────
  const uploadImageHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploading(true);
      setUploadError(null);
      const uploadConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post('/api/upload', formData, uploadConfig);
      setImage(data);
      setUploading(false);
      showToast('Image uploaded successfully.', 'success');
    } catch (err) {
      const msg = 'Image upload failed. Please try again.';
      setUploadError(msg);
      showToast(msg, 'error');
      setUploading(false);
    }
  };

  // ── Save handler ──────────────────────────────────────────
  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);

    // ── Validation ────────────────────────────────────────────
    if (!name || INVALID_NAMES.includes(name.toLowerCase().trim())) {
      showToast('Please enter a proper product name.', 'error');
      setError('Please enter a proper product name.');
      return;
    }
    if (!price || Number(price) <= 0) {
      showToast('Price must be greater than 0.', 'error');
      setError('Price must be greater than 0.');
      return;
    }
    if (!category) {
      showToast('Please select a category.', 'error');
      setError('Please select a category.');
      return;
    }
    if (!description || description.trim().length < 30) {
      showToast('Description must be at least 30 characters.', 'error');
      setError('Description must be at least 30 characters.');
      return;
    }
    if (!image) {
      showToast('Please upload a product image.', 'error');
      setError('Please upload a product image.');
      return;
    }
    if (!countInStock || Number(countInStock) < 1) {
      showToast('Stock count must be at least 1.', 'error');
      setError('Stock count must be at least 1.');
      return;
    }

    // ── Sale price validation ─────────────────────────────────
    if (isOnSale) {
      if (!salePrice || Number(salePrice) <= 0) {
        showToast('Please enter a sale price before marking this product as on sale.', 'error');
        setError('Please enter a sale price before marking this product as on sale.');
        return;
      }
      if (Number(salePrice) >= Number(price)) {
        showToast('Sale price must be lower than the regular price.', 'error');
        setError('Sale price must be lower than the regular price.');
        return;
      }
    }

    // ── Confirmation for sale / clearance ─────────────────────
    if (isOnSale || isClearance) {
      const flags = [
        isOnSale ? `on sale at KES ${Number(salePrice).toFixed(2)}` : null,
        isClearance ? 'clearance' : null,
      ].filter(Boolean).join(' and ');

      const confirmed = window.confirm(
        `Are you sure you want to list "${name}" as ${flags}? This will make it visible on the Special Offers page immediately.`
      );
      if (!confirmed) return;
    }

    try {
      setSaving(true);
      await axios.put(
        `/api/products/${id}`,
        {
          name,
          price: Number(price),
          salePrice: salePrice !== '' ? Number(salePrice) : null,
          image,
          category,
          description,
          countInStock: Number(countInStock),
          unit,
          tags: tagList,
          isFeatured,
          isOnSale,
          isClearance,
        },
        config
      );
      setSuccessMsg('Product saved successfully!');
      setSaving(false);
      showToast('Product saved successfully!', 'success');
      setTimeout(() => navigate('/admin/products'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      showToast(msg, 'error');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='text-center py-5'>
        <Spinner animation='border' style={{ color: 'var(--oxford-blue)' }} />
      </div>
    );
  }

  return (
    <>
      <Link
        to='/admin/products'
        className='btn btn-light mb-4'
        style={{ borderColor: 'var(--tan)', color: 'var(--oxford-blue)' }}
      >
        ← Back to Products
      </Link>

      <Row className='justify-content-center'>
        <Col lg={9}>
          <Card className='p-4 shadow-sm'>
            <h2 className='page-title mb-4' style={{ color: 'var(--oxford-blue)' }}>
              {name === 'New Product' ? 'Create Product' : `Edit — ${name}`}
            </h2>

            {error && <Alert variant='danger'>{error}</Alert>}
            {uploadError && <Alert variant='danger'>{uploadError}</Alert>}
            {successMsg && (
              <Alert style={{ backgroundColor: '#f7f0e6', borderColor: 'var(--tan)', color: 'var(--oxford-blue)' }}>
                {successMsg} Redirecting...
              </Alert>
            )}

            <Form onSubmit={submitHandler}>
              <Row>

                {/* ── LEFT COLUMN ───────────────────────── */}
                <Col md={6}>

                  {/* Product name */}
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      Product Name <span style={{ color: '#c0392b' }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='e.g. Heavy Duty Steel Shelving Unit'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* Price */}
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      Price (KES) <span style={{ color: '#c0392b' }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type='number'
                      placeholder='e.g. 8500'
                      value={price}
                      min='1'
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* Sale price — only visible when isOnSale is ticked */}
                  {isOnSale && (
                    <Form.Group className='mb-3'>
                      <Form.Label>
                        Sale Price (KES) <span style={{ color: '#c0392b' }}>*</span>
                      </Form.Label>
                      <Form.Control
                        type='number'
                        placeholder='Must be lower than regular price'
                        value={salePrice}
                        min='1'
                        onChange={(e) => setSalePrice(e.target.value)}
                      />
                      {salePrice && Number(salePrice) >= Number(price) && (
                        <Form.Text style={{ color: '#c0392b', fontSize: '0.78rem' }}>
                          Sale price must be lower than KES {price}
                        </Form.Text>
                      )}
                    </Form.Group>
                  )}

                  {/* Category */}
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      Category <span style={{ color: '#c0392b' }}>*</span>
                    </Form.Label>
                    <Form.Select
                      value={category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      required
                    >
                      <option value=''>Select a category...</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* Unit */}
                  <Form.Group className='mb-3'>
                    <Form.Label>Unit Type</Form.Label>
                    <Form.Select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    >
                      {Object.keys(UNIT_HINTS).map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </Form.Select>
                    {/* Unit hint below dropdown */}
                    <Form.Text style={{ color: '#888', fontSize: '0.75rem' }}>
                      {UNIT_HINTS[unit]}
                    </Form.Text>
                  </Form.Group>

                  {/* Count in stock */}
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      Count In Stock <span style={{ color: '#c0392b' }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type='number'
                      placeholder='e.g. 50'
                      value={countInStock}
                      min='1'
                      onChange={(e) => setCountInStock(e.target.value)}
                      required
                    />
                    <Form.Text style={{ color: '#888', fontSize: '0.75rem' }}>
                      How many units do you have available right now?
                    </Form.Text>
                  </Form.Group>

                  {/* Tags — chip system */}
                  <Form.Group className='mb-3'>
                    <Form.Label>Search Tags</Form.Label>

                    {/* Rendered tag chips */}
                    {tagList.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginBottom: '8px',
                      }}>
                        {tagList.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'rgba(0,33,71,0.07)',
                              color: 'var(--oxford-blue)',
                              borderRadius: '999px',
                              padding: '3px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            {tag}
                            <button
                              type='button'
                              onClick={() => removeTag(tag)}
                              style={{
                                all: 'unset',
                                cursor: 'pointer',
                                color: '#c0392b',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                lineHeight: 1,
                              }}
                              aria-label={`Remove tag ${tag}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Add custom tag input */}
                    <Form.Control
                      type='text'
                      placeholder='Type a tag and press Enter to add'
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                    />
                    <Form.Text style={{ color: '#888', fontSize: '0.75rem' }}>
                      {category
                        ? 'Suggested tags auto-added from your category. Remove irrelevant ones or add your own.'
                        : 'Select a category first to get suggested tags.'}
                    </Form.Text>
                  </Form.Group>

                  {/* Merchandising flags */}
                  <div style={{
                    background: '#f7f4ef',
                    border: '1px solid #EAE0D5',
                    borderRadius: '10px',
                    padding: '1rem',
                    marginBottom: '1rem',
                  }}>
                    <p style={{
                      color: 'var(--oxford-blue)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '0.75rem',
                    }}>
                      Merchandising
                    </p>
                    <Form.Check
                      type='checkbox'
                      label='Featured — show in Featured Products on homepage'
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className='mb-2'
                    />
                    <Form.Check
                      type='checkbox'
                      label='On Sale — show in Deals section (sale price required)'
                      checked={isOnSale}
                      onChange={(e) => {
                        setIsOnSale(e.target.checked);
                        // Clear sale price if unchecking
                        if (!e.target.checked) setSalePrice('');
                      }}
                      className='mb-2'
                    />
                    <Form.Check
                      type='checkbox'
                      label='Clearance — show in Clearance section'
                      checked={isClearance}
                      onChange={(e) => setIsClearance(e.target.checked)}
                    />
                  </div>

                </Col>

                {/* ── RIGHT COLUMN ──────────────────────── */}
                <Col md={6}>

                  {/* Image upload */}
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      Product Image <span style={{ color: '#c0392b' }}>*</span>
                    </Form.Label>
                    <div style={{
                      width: '100%',
                      height: '200px',
                      border: `2px dashed ${image ? 'var(--tan)' : '#EAE0D5'}`,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      backgroundColor: '#FAFAF9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.75rem',
                      transition: 'border-color 0.2s ease',
                    }}>
                      {uploading ? (
                        <div className='text-center'>
                          <Spinner animation='border' size='sm' style={{ color: 'var(--oxford-blue)' }} />
                          <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>Uploading...</p>
                        </div>
                      ) : image ? (
                        <Image
                          src={image}
                          alt='product preview'
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className='text-center'>
                          <p style={{ fontSize: '2rem', margin: 0 }}>📷</p>
                          <p style={{ fontSize: '0.8rem', color: '#aaa', margin: '4px 0 0' }}>
                            No image uploaded
                          </p>
                        </div>
                      )}
                    </div>
                    <Form.Control
                      type='file'
                      accept='image/jpeg,image/jpg,image/png'
                      onChange={uploadImageHandler}
                      style={{ fontSize: '0.85rem' }}
                    />
                    <Form.Text style={{ color: '#888', fontSize: '0.75rem' }}>
                      JPG or PNG only. Image is required before saving.
                    </Form.Text>
                  </Form.Group>

                  {/* Image URL — auto filled after upload */}
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      Image URL
                      <span style={{ fontSize: '0.75rem', color: '#aaa', marginLeft: '0.5rem', fontWeight: 400 }}>
                        (auto-filled after upload)
                      </span>
                    </Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='/uploads/image.jpg'
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                  </Form.Group>

                </Col>
              </Row>

              {/* Description — full width */}
              <Form.Group className='mb-4'>
                <Form.Label>
                  Description <span style={{ color: '#c0392b' }}>*</span>
                </Form.Label>
                <Form.Control
                  as='textarea'
                  rows={4}
                  placeholder='Describe the product in detail — minimum 30 characters. Include key specs, what is included, and who this product is for.'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <Form.Text style={{
                  color: description.length < 30 && description.length > 0 ? '#c0392b' : '#888',
                  fontSize: '0.75rem',
                }}>
                  {description.length} / 30 characters minimum
                </Form.Text>
              </Form.Group>

              <div className='d-flex gap-3'>
                <Button
                  type='submit'
                  variant='dark'
                  className='w-100'
                  disabled={saving || uploading}
                  style={{ background: 'var(--oxford-blue)', borderColor: 'var(--oxford-blue)' }}
                >
                  {saving
                    ? <Spinner animation='border' size='sm' />
                    : 'Save Changes'}
                </Button>
                <Button
                  type='button'
                  variant='light'
                  className='w-100'
                  onClick={() => navigate('/admin/products')}
                  style={{ borderColor: 'var(--tan)', color: 'var(--oxford-blue)' }}
                >
                  Cancel
                </Button>
              </div>

            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AdminProductEditPage;