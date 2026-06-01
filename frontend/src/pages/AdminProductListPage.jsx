// frontend/src/pages/AdminProductListPage/AdminProductListPage.jsx
// ─────────────────────────────────────────────────────────────
// Admin page — lists all products with edit and delete actions.
// All inline styles removed and moved to AdminProductListPage.css.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Table, Button, Row, Col,
  Alert, Spinner, Badge,
} from 'react-bootstrap';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import axios from 'axios';
import { showToast } from '../components/Toast/Toast';
import './AdminProductListPage.css';

const AdminProductListPage = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => { document.title = 'Admin: Product List — ShopZone'; }, []);

  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [deleteId, setDeleteId]         = useState(null);
  const [showModal, setShowModal]       = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p._id.toLowerCase().includes(q);
  });

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) { navigate('/login'); return; }
    fetchProducts();
  }, [userInfo, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
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

  const confirmDelete = (id) => { setDeleteId(id); setShowModal(true); };

  const deleteHandler = async () => {
    try {
      setDeleteLoading(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`/api/products/${deleteId}`, config);
      setShowModal(false);
      setDeleteLoading(false);
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
        { name: 'New Product', price: 0, image: '/images/sample.jpg', category: 'General Merchandise', description: 'Product description', countInStock: 0, unit: 'Per Unit' },
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
      {/* ── Delete confirmation modal ─────────────────────── */}
      <ConfirmModal
        show={showModal}
        onConfirm={deleteHandler}
        onCancel={() => setShowModal(false)}
        title='Delete Product'
        message='Are you sure you want to delete this product?'
        subMessage='This action cannot be undone.'
        confirmLabel={deleteLoading ? 'Deleting...' : 'Yes, Delete'}
        confirmVariant='danger'
      />

      {/* ── Page header ───────────────────────────────────── */}
      <Row className='align-items-center mb-4'>
        <Col>
          <h2 className='apl-page-title'>Products</h2>
        </Col>
        <Col className='text-end'>
          <Button className='apl-create-btn' onClick={createProductHandler}>
            + Create Product
          </Button>
        </Col>
      </Row>

      {error && <Alert variant='danger'>{error}</Alert>}

      {/* ── Search bar ────────────────────────────────────── */}
      <Row className='mb-3'>
        <Col md={5}>
          <input
            type='text'
            className='form-control'
            placeholder='Search by product name or ID...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Col>
        <Col className='d-flex align-items-center'>
          {searchQuery && (
            <span className='apl-result-count'>
              {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found
            </span>
          )}
        </Col>
      </Row>

      {loading ? (
        <div className='text-center py-5'>
          <Spinner animation='border' className='apl-spinner' />
        </div>
      ) : (
        <Table responsive hover className='apl-table'>
          <thead>
            <tr className='apl-thead-row'>
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
            {filteredProducts.map((product, index) => (
              <tr
                key={product._id}
                className={`apl-tbody-row${index % 2 === 0 ? '' : ' apl-tbody-row--alt'}`}
              >
                <td className='apl-id-cell'>{product._id.slice(-8)}</td>
                <td>
                  <img
                    src={product.image}
                    alt={product.name}
                    className='apl-product-thumb'
                  />
                </td>
                <td className='apl-name-cell'>{product.name}</td>
                <td className='product-card-price'>
                  {`KES ${Number(product.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`}
                </td>
                <td>
                  <Badge className='apl-unit-badge'>
                    {product.unit || 'Per Unit'}
                  </Badge>
                </td>
                <td className='apl-muted-cell'>{product.category}</td>
                <td>
                  <span className={product.countInStock > 0 ? 'apl-stock--in' : 'apl-stock--out'}>
                    {product.countInStock}
                  </span>
                </td>
                <td>
                  <div className='d-flex gap-2'>
                    <Link to={`/admin/product/${product._id}/edit`} className='apl-edit-btn'>
                      Edit
                    </Link>
                    <Button size='sm' variant='danger' className='apl-delete-btn' onClick={() => confirmDelete(product._id)}>
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