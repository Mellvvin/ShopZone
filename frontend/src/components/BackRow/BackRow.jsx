import { useLocation, useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import './BackRow.css';

const BackRow = () => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  // The bare home page is the root: nothing to go back to. Home with a
  // ?category= or search filter is a real destination, so it gets Back.
  if (pathname === '/' && !search) return null;

  const goBack = () => {
    // react-router stamps history.state.idx; 0 means this is the first
    // entry (shared link, new tab), so fall back to Home instead.
    if (window.history.state && window.history.state.idx > 0) navigate(-1);
    else navigate('/');
  };

  return (
    <div className='back-row'>
      <button
        type='button'
        className='back-row__btn'
        onClick={goBack}
        aria-label='Go back to the previous page'
      >
        <FaChevronLeft aria-hidden='true' />
        <span>Back</span>
      </button>
    </div>
  );
};

export default BackRow;