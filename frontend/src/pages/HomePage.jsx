import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Alert } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { listProducts } from '../redux/slices/productSlice';

const HomePage = () => {
  const dispatch = useDispatch();

  const { products, loading, error } = useSelector(
    (state) => state.products.productList
  );

  useEffect(() => {
    dispatch(listProducts(''));
  }, [dispatch]);

  return (
    <>
      <h1 className='page-title'>Latest Products</h1>
      {loading ? (
        <Row>
          {[...Array(8)].map((_, index) => (
            <Col key={index} sm={12} md={6} lg={4} xl={3}>
              <SkeletonCard />
            </Col>
          ))}
        </Row>
      ) : error ? (
        <Alert variant='danger'>{error}</Alert>
      ) : products.length === 0 ? (
        <Alert style={{
          backgroundColor: 'var(--tan-light)',
          borderColor:     'var(--tan)',
          color:           'var(--oxford-blue)',
        }}>
          No products found matching your search.
        </Alert>
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