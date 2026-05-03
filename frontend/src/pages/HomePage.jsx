import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Spinner, Alert } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import { listProducts } from '../redux/slices/productSlice';

const HomePage = () => {
  const dispatch = useDispatch();

  const { products, loading, error } = useSelector(
    (state) => state.products.productList
  );

  useEffect(() => {
    dispatch(listProducts());
  }, [dispatch]);

  return (
    <>
      <h1 className='page-title'>Latest Products</h1>
      {loading ? (
        <div className='text-center py-5'>
          <Spinner
            animation='border'
            style={{ color: 'var(--oxford-blue)' }}
          />
        </div>
      ) : error ? (
        <Alert variant='danger'>{error}</Alert>
      ) : (
        <Row>
          {products.map((product) => (
            <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default HomePage;