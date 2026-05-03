import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/slices/authSlice';

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo, loading, error } = useSelector((state) => state.auth);

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, navigate, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <Row className='justify-content-md-center mt-5'>
      <Col md={5}>
        <Card className='p-4 shadow-sm'>
          <h2 className='text-center mb-4'>Sign In</h2>

          {error && (
            <Alert variant='danger'>{error}</Alert>
          )}

          <Form onSubmit={submitHandler}>
            <Form.Group controlId='email' className='mb-3'>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type='email'
                placeholder='Enter email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId='password' className='mb-3'>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Enter password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button
              type='submit'
              variant='dark'
              className='w-100 mt-2'
              disabled={loading}
            >
              {loading ? (
                <Spinner animation='border' size='sm' />
              ) : (
                'Sign In'
              )}
            </Button>
          </Form>

          <Row className='mt-3'>
            <Col className='text-center'>
              New customer?{' '}
              <Link
                to={redirect ? `/register?redirect=${redirect}` : '/register'}
              >
                Register here
              </Link>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;