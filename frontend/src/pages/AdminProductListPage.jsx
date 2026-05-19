// frontend/src/pages/AdminProductListPage.jsx
// ─────────────────────────────────────────────────────────────
// Admin page — lists all products with edit and delete actions.
// Toasts added for: product deleted, product created, errors.
// Category dropdown updated to match MongoDB category strings.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Table, Button, Row, Col,
  Alert, Spinner, Modal, Badge,
} from 'react-bootstrap';
import axios from 'axios';
import { showToast } from '../components/Toast/Toast';

const AdminProductListPage = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch all products ────────────────────────────────────
  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, [userInfo, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.get('/api/products', config);
      setProducts(data);
      setLoading(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      showToast(msg, 'error');
      setLoading(false);
    }
  };

  // ── Delete handlers ───────────────────────────────────────
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const deleteHandler = async () => {
    try {
      setDeleteLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.delete(`/api/products/${deleteId}`, config);
      setShowModal(false);
      setDeleteLoading(false);
      // Both inline and toast
      showToast('Product deleted successfully.', 'success');
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      showToast(msg, 'error');
      setDeleteLoading(false);
      setShowModal(false);
    }
  };

  // ── Create product handler ────────────────────────────────
  const createProductHandler = async () => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post(
        '/api/products',
        {
          name: 'New Product',
          price: 0,
          image: '/images/sample.jpg',
          category: 'General Merchandise',
          description: 'Product description',
          countInStock: 0,
          unit: 'Per Unit',
        },
        config
      );
      showToast('New product created. Fill in the details below.', 'info');
      navigate(`/admin/product/${data._id}/edit`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <>
      {/* ── Delete Confirmation Modal ─────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header style={{ backgroundColor: 'var(--oxford-blue)' }}>
          <Modal.Title style={{ color: 'var(--tan)' }}>Delete Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this product?</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='light'
            onClick={() => setShowModal(false)}
            style={{ borderColor: 'var(--tan)', color: 'var(--oxford-blue)' }}
          >
            Cancel
          </Button>
          <Button variant='danger' onClick={deleteHandler} disabled={deleteLoading}>
            {deleteLoading ? <Spinner animation='border' size='sm' /> : 'Yes, Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Page header ──────────────────────────────────── */}
      <Row className='align-items-center mb-4'>
        <Col>
          <h2 style={{ color: 'var(--oxford-blue)' }} className='page-title'>
            Products
          </h2>
        </Col>
        <Col className='text-end'>
          <Button variant='dark' onClick={createProductHandler}>
            + Create Product
          </Button>
        </Col>
      </Row>

      {/* Inline error */}
      {error && <Alert variant='danger'>{error}</Alert>}

      {loading ? (
        <div className='text-center py-5'>
          <Spinner animation='border' style={{ color: 'var(--oxford-blue)' }} />
        </div>
      ) : (
        <Table responsive hover style={{ fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--oxford-blue)', color: 'var(--tan)' }}>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Unit</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={product._id}
                style={{
                  backgroundColor: index % 2 === 0 ? 'white' : '#FAFAF9',
                  verticalAlign: 'middle',
                }}
              >
                <td style={{ fontFamily: 'Courier New', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {product._id.slice(-8)}
                </td>
                <td>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #EAE0D5' }}
                  />
                </td>
                <td style={{ fontWeight: 500, color: 'var(--oxford-blue)' }}>
                  {product.name}
                </td>
                <td className='product-card-price'>${product.price}</td>
                <td>
                  <Badge style={{ backgroundColor: 'var(--oxford-blue)', color: 'var(--tan)', fontSize: '0.72rem', padding: '4px 8px', borderRadius: '20px' }}>
                    {product.unit || 'Per Unit'}
                  </Badge>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{product.category}</td>
                <td>
                  <span style={{ color: product.countInStock > 0 ? 'green' : 'red', fontWeight: 600 }}>
                    {product.countInStock}
                  </span>
                </td>
                <td>
                  <div className='d-flex gap-2'>
                    <Link
                      to={`/admin/product/${product._id}/edit`}
                      className='btn btn-sm'
                      style={{ backgroundColor: 'var(--oxford-blue)', color: 'var(--tan)', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem' }}
                    >
                      Edit
                    </Link>
                    <Button
                      size='sm'
                      variant='danger'
                      onClick={() => confirmDelete(product._id)}
                      style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem' }}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default AdminProductListPage;