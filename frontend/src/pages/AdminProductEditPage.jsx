import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Form, Button, Card, Alert,
  Spinner, Row, Col, Image
} from 'react-bootstrap';
import axios from 'axios';

const AdminProductEditPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [name, setName]               = useState('');
  const [price, setPrice]             = useState(0);
  const [image, setImage]             = useState('');
  const [category, setCategory]       = useState('');
  const [description, setDescription] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [unit, setUnit]               = useState('Per Unit');
  const [uploading, setUploading]     = useState(false);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [successMsg, setSuccessMsg]   = useState(null);

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
      setImage(data.image);
      setCategory(data.category);
      setDescription(data.description);
      setCountInStock(data.countInStock);
      setUnit(data.unit || 'Per Unit');
      setLoading(false);
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
      setLoading(false);
    }
  };

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
          'Content-Type':  'multipart/form-data',
          Authorization:   `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post('/api/upload', formData, config);
      setImage(data);
      setUploading(false);
    } catch (err) {
      setUploadError('Image upload failed. Please try again.');
      setUploading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${userInfo.token}`,
        },
      };
      await axios.put(
        `/api/products/${id}`,
        { name, price, image, category, description, countInStock, unit },
        config
      );
      setSuccessMsg('Product updated successfully!');
      setSaving(false);
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
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
        <Col lg={8}>
          <Card className='p-4 shadow-sm'>
            <h2
              className='page-title mb-4'
              style={{ color: 'var(--oxford-blue)' }}
            >
              {name === 'New Product' ? 'Create Product' : 'Edit Product'}
            </h2>

            {error      && <Alert variant='danger'>{error}</Alert>}
            {uploadError && <Alert variant='danger'>{uploadError}</Alert>}
            {successMsg && (
              <Alert style={{
                backgroundColor: 'var(--tan-light)',
                borderColor:     'var(--tan)',
                color:           'var(--oxford-blue)',
              }}>
                {successMsg} Redirecting...
              </Alert>
            )}

            <Form onSubmit={submitHandler}>
              <Row>
                {/* ── LEFT COLUMN ── */}
                <Col md={6}>
                  <Form.Group controlId='name' className='mb-3'>
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='Enter product name'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId='price' className='mb-3'>
                    <Form.Label>Price ($)</Form.Label>
                    <Form.Control
                      type='number'
                      placeholder='Enter price'
                      value={price}
                      min='0'
                      step='0.01'
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId='category' className='mb-3'>
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      as='select'
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value=''>Select category...</option>
                      <option value='Electronics'>Electronics</option>
                      <option value='Fashion'>Fashion</option>
                      <option value='Home & Kitchen'>Home & Kitchen</option>
                      <option value='Office Supplies'>Office Supplies</option>
                      <option value='Food & Beverage'>Food & Beverage</option>
                      <option value='Beauty'>Beauty</option>
                      <option value='Hardware'>Hardware</option>
                      <option value='General'>General</option>
                    </Form.Control>
                  </Form.Group>

                  <Form.Group controlId='unit' className='mb-3'>
                    <Form.Label>Unit Type</Form.Label>
                    <Form.Control
                      as='select'
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    >
                      <option value='Per Unit'>Per Unit</option>
                      <option value='Per Bale'>Per Bale</option>
                      <option value='Per Carton'>Per Carton</option>
                      <option value='Per Dozen'>Per Dozen</option>
                      <option value='Per Kg'>Per Kg</option>
                      <option value='Per Box'>Per Box</option>
                      <option value='Per Sack'>Per Sack</option>
                    </Form.Control>
                  </Form.Group>

                  <Form.Group controlId='countInStock' className='mb-3'>
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
                </Col>

                {/* ── RIGHT COLUMN ── */}
                <Col md={6}>
                  {/* Image Preview */}
                  <Form.Group className='mb-3'>
                    <Form.Label>Product Image</Form.Label>
                    <div style={{
                      width:           '100%',
                      height:          '200px',
                      border:          '2px dashed #EAE0D5',
                      borderRadius:    '10px',
                      overflow:        'hidden',
                      backgroundColor: '#FAFAF9',
                      display:         'flex',
                      alignItems:      'center',
                      justifyContent:  'center',
                      marginBottom:    '0.75rem',
                      position:        'relative',
                    }}>
                      {uploading ? (
                        <div className='text-center'>
                          <Spinner
                            animation='border'
                            size='sm'
                            style={{ color: 'var(--oxford-blue)' }}
                          />
                          <p style={{
                            fontSize: '0.8rem',
                            color:    'var(--text-muted)',
                            marginTop: '0.5rem',
                          }}>
                            Uploading...
                          </p>
                        </div>
                      ) : image ? (
                        <Image
                          src={image}
                          alt='product preview'
                          style={{
                            width:     '100%',
                            height:    '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div className='text-center'>
                          <p style={{ fontSize: '2rem' }}>📷</p>
                          <p style={{
                            fontSize: '0.8rem',
                            color:    'var(--text-muted)',
                          }}>
                            No image selected
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
                    <Form.Text style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      JPG or PNG only. Image will be uploaded immediately on selection.
                    </Form.Text>
                  </Form.Group>

                  {/* Image URL manual entry */}
                  <Form.Group controlId='image' className='mb-3'>
                    <Form.Label>
                      Image URL
                      <span style={{
                        fontSize:    '0.75rem',
                        color:       'var(--text-muted)',
                        marginLeft:  '0.5rem',
                        fontWeight:  '400',
                      }}>
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
              <Form.Group controlId='description' className='mb-4'>
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
                  {saving ? (
                    <Spinner animation='border' size='sm' />
                  ) : (
                    name === 'New Product' ? 'Create Product' : 'Save Changes'
                  )}
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