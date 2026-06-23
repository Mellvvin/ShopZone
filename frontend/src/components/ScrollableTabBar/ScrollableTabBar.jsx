// frontend/src/components/ScrollableTabBar/ScrollableTabBar.jsx
// ─────────────────────────────────────────────────────────────
// Wraps any horizontal row of tabs or filter chips and adds left
// and right scroll arrows whenever the content overflows its
// container. Used anywhere a tab bar can run wider than the
// viewport — admin list pages and SpecialOffersPage.
//
// Usage:
//   <ScrollableTabBar className='enq-tabs' role='tablist'>
//     {tabs.map(tab => <button>...</button>)}
//   </ScrollableTabBar>
//
// The className passed in is applied to the INNER scrollable
// track, so existing tab styling (gap, padding, flex) keeps
// working exactly as before — only scroll behaviour and the
// arrow buttons are new.
// ─────────────────────────────────────────────────────────────
import { useRef, useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './ScrollableTabBar.css';

const ScrollableTabBar = ({ children, className = '', scrollAmount = 220, ...rest }) => {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft]   = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Checks the track's current scroll position against its bounds
  // and shows/hides each arrow accordingly. Both arrows stay hidden
  // entirely when the content fits without overflowing.
  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 1;
    setCanScrollLeft(hasOverflow && el.scrollLeft > 2);
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    updateArrows();
    // Re-check on resize — a narrower viewport can introduce
    // overflow that wasn't there on initial render.
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [updateArrows, children]);

  const scrollByAmount = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className='stb-wrap'>
      {canScrollLeft && (
        <button
          type='button'
          className='stb-arrow stb-arrow--left'
          onClick={() => scrollByAmount(-1)}
          aria-label='Scroll tabs left'
        >
          <FaChevronLeft aria-hidden='true' />
        </button>
      )}

      <div
        ref={trackRef}
        className={`stb-track ${className}`}
        onScroll={updateArrows}
        {...rest}
      >
        {children}
      </div>

      {canScrollRight && (
        <button
          type='button'
          className='stb-arrow stb-arrow--right'
          onClick={() => scrollByAmount(1)}
          aria-label='Scroll tabs right'
        >
          <FaChevronRight aria-hidden='true' />
        </button>
      )}
    </div>
  );
};

export default ScrollableTabBar;