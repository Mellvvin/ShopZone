import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AnnouncementBar.css';

const MESSAGES = [
  { text: 'Browse our catalogue of deals', cta: 'Shop deals', to: '/offers' },
  { text: 'Check out our new arrivals', cta: "See what's new", to: '/new-arrivals' },
  { text: 'Buying in bulk? Unlock wholesale savings', cta: 'Bulk orders', to: '/bulk-orders' },
];

const ROTATE_MS = 4500;

const AnnouncementBar = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused]);

  const current = MESSAGES[index];

  return (
    <div
      className='announce-bar'
      role='region'
      aria-label='Promotions'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <p key={index} className='announce-bar__msg'>
        {current.text}{' '}
        <Link to={current.to} className='announce-bar__link'>{current.cta} →</Link>
      </p>
      <div className='announce-bar__dots'>
        {MESSAGES.map((m, i) => (
          <button
            key={m.to}
            type='button'
            className={`announce-bar__dot${i === index ? ' announce-bar__dot--active' : ''}`}
            aria-label={`Show promotion ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;