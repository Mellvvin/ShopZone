// frontend/src/components/ProductCard/SkeletonCard.jsx
// ─────────────────────────────────────────────────────────────
// Skeleton loading placeholder rendered while products fetch.
// Uses the same hp-skeleton-* CSS classes as the product grid.
// Extracted from HomePage.jsx — no logic, pure visual placeholder.
// ─────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className='hp-skeleton-card' aria-hidden='true'>
    <div className='hp-skeleton hp-skeleton--img' />
    <div className='hp-skeleton hp-skeleton--line hp-skeleton--short' />
    <div className='hp-skeleton hp-skeleton--line' />
    <div className='hp-skeleton hp-skeleton--line hp-skeleton--price' />
  </div>
);

export default SkeletonCard;