// frontend/src/pages/AdminProductEditPage.jsx
// ─────────────────────────────────────────────────────────────
// Admin page — edit or create a single product.
// Toasts added for: product saved, upload error, errors.
// Category dropdown updated to match MongoDB category strings.
// New fields added: salePrice, tags, isFeatured, isOnSale,
//                   isClearance.
// ─────────────────────────────────────────────────────────────
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

const AdminProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // ── Form field state ──────────────────────────────────────
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [salePrice, setSalePrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [unit, setUnit] = useState('Per Unit');
  const [tags, setTags] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isOnSale, setIsOnSale] = useState(false);
  const [isClearance, setIsClearance] = useState(false);

  // ── UI state ──────────────────────────────────────────────
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // ── Fetch existing product data ───────────────────────────
  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
      return;
    }
    fetchProduct();
  }, [userInfo, navigate]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/products/${id}`);
      setName(data.name);
      setPrice(data.price);
      setSalePrice(data.salePrice ?? '');
      setImage(data.image);
      setCategory(data.category);
      setDescription(data.description);
      setCountInStock(data.countInStock);
      setUnit(data.unit || 'Per Unit');
      // Tags are stored as array — display as comma-separated string
      setTags(data.tags ? data.tags.join(', ') : '');
      setIsFeatured(data.isFeatured || false);
      setIsOnSale(data.isOnSale || false);
      setIsClearance(data.isClearance || false);
      setLoading(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      showToast(msg, 'error');
      setLoading(false);
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
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post('/api/upload', formData, config);
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

  // ── Save product handler ──────────────────────────────────
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
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
          // Convert comma-separated string back to array
          tags: tags
            ? tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
            : [],
          isFeatured,
          isOnSale,
          isClearance,
        },
        config
      );
      setSuccessMsg('Product saved successfully!');
      setSaving(false);
      // Fire both inline success and toast
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
              {name === 'New Product' ? 'Create Product' : 'Edit Product'}
            </h2>

            {/* Inline alerts */}
            {error && <Alert variant='danger'>{error}</Alert>}
            {uploadError && <Alert variant='danger'>{uploadError}</Alert>}
            {successMsg && (
              <Alert style={{ backgroundColor: 'var(--tan-light)', borderColor: 'var(--tan)', color: 'var(--oxford-blue)' }}>
                {successMsg} Redirecting...
              </Alert>
            )}

            <Form onSubmit={submitHandler}>
              <Row>

                {/* ── LEFT COLUMN ───────────────────────── */}
                <Col md={6}>

                  {/* Product name */}
                  <Form.Group className='mb-3'>
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='Enter product name'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* Price */}
                  <Form.Group className='mb-3'>
                    <Form.Label>Price (KES)</Form.Label>
                    <Form.Control
                      type='number'
                      placeholder='Enter price'
                      value={price}
                      min='0'
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* Sale price */}
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      Sale Price (KES)
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: '0.5rem' }}>
                        — leave blank if not on sale
                      </span>
                    </Form.Label>
                    <Form.Control
                      type='number'
                      placeholder='e.g. 3500'
                      value={salePrice}
                      min='0'
                      onChange={(e) => setSalePrice(e.target.value)}
                    />
                  </Form.Group>

                  {/* Category */}
                  <Form.Group className='mb-3'>
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value=''>Select category...</option>
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
                      <option value='Per Unit'>Per Unit</option>
                      <option value='Bale'>Bale</option>
                      <option value='Carton'>Carton</option>
                      <option value='Dozen'>Dozen</option>
                      <option value='Kg'>Kg</option>
                      <option value='Box'>Box</option>
                      <option value='Sack'>Sack</option>
                    </Form.Select>
                  </Form.Group>

                  {/* Count in stock */}
                  <Form.Group className='mb-3'>
                    <Form.Label>Count In Stock</Form.Label>
                    <Form.Control
                      type='number'
                      placeholder='Enter stock count'
                      value={countInStock}
                      min='0'
                      onChange={(e) => setCountInStock(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* Tags */}
                  <Form.Group className='mb-3'>
                    <Form.Label>Tags</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='e.g. wholesale, bulk, samsung, electronics'
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                    <Form.Text style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      Comma-separated keywords. Used in search results.
                    </Form.Text>
                  </Form.Group>

                  {/* Merchandising flags */}
                  <div
                    style={{
                      background: '#f7f4ef',
                      border: '1px solid #EAE0D5',
                      borderRadius: '10px',
                      padding: '1rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <p style={{ color: 'var(--oxford-blue)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
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
                      label='On Sale — show in Deals section (requires Sale Price)'
                      checked={isOnSale}
                      onChange={(e) => setIsOnSale(e.target.checked)}
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

                  {/* Image preview + upload */}
                  <Form.Group className='mb-3'>
                    <Form.Label>Product Image</Form.Label>
                    <div style={{
                      width: '100%',
                      height: '200px',
                      border: '2px dashed #EAE0D5',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      backgroundColor: '#FAFAF9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.75rem',
                    }}>
                      {uploading ? (
                        <div className='text-center'>
                          <Spinner animation='border' size='sm' style={{ color: 'var(--oxford-blue)' }} />
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Uploading...</p>
                        </div>
                      ) : image ? (
                        <Image src={image} alt='product preview' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className='text-center'>
                          <p style={{ fontSize: '2rem' }}>📷</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No image selected</p>
                        </div>
                      )}
                    </div>
                    <Form.Control
                      type='file'
                      accept='image/jpeg,image/jpg,image/png'
                      onChange={uploadImageHandler}
                      style={{ fontSize: '0.85rem' }}
                    />
                    <Form.Text style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      JPG or PNG only. Uploads immediately on selection.
                    </Form.Text>
                  </Form.Group>

                  {/* Image URL */}
                  <Form.Group className='mb-3'>
                    <Form.Label>
                      Image URL
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 400 }}>
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
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={4}
                  placeholder='Enter product description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Form.Group>

              <div className='d-flex gap-3'>
                <Button
                  type='submit'
                  variant='dark'
                  className='w-100'
                  disabled={saving || uploading}
                >
                  {saving ? <Spinner animation='border' size='sm' /> : 'Save Changes'}
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