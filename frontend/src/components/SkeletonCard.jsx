const SkeletonCard = () => {
  return (
    <div className='skeleton-card'>
      <div className='skeleton-img' />
      <div style={{ padding: '1rem' }}>
        <div className='skeleton-line skeleton-title' />
        <div className='skeleton-line skeleton-short' />
        <div className='skeleton-line skeleton-price' />
      </div>
    </div>
  );
};

export default SkeletonCard;