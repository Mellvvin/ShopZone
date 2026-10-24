// frontend/src/components/OptionalBoundary/OptionalBoundary.jsx
// ─────────────────────────────────────────────────────────────
// Wraps NON-ESSENTIAL UI (notices, widgets) so that if it fails to
// load or crashes, it silently renders nothing instead of taking the
// whole app down. Needed because ad/tracker blockers can block a
// component's file, and a failed lazy import throws during render.
//
// Use with React.lazy:
//   <OptionalBoundary><Suspense fallback={null}><Thing /></Suspense></OptionalBoundary>
// Never wrap essential UI (header, routes, checkout) in this.
// ─────────────────────────────────────────────────────────────
import { Component } from 'react';

class OptionalBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn('Optional component failed to load (an extension may have blocked it):', error?.message);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default OptionalBoundary;