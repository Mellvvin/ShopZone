// frontend/src/utils/navigationService.js
// ─────────────────────────────────────────────────────────────
// Lets code OUTSIDE the React component tree (like an axios
// interceptor) trigger a real react-router navigation instead of
// a hard window.location redirect. A hard redirect would wipe out
// the ability to pass state.from to LoginPage, which is what makes
// "send the user back to the page they were on after they log in
// again" work everywhere else in the app.
//
// How it works:
// - One component rendered inside <BrowserRouter> in App.jsx calls
//   useNavigate() and hands that function to setNavigator() once,
//   on mount.
// - Anything else — including code with no access to React hooks
//   at all — can then call redirectTo(path, options) and it behaves
//   exactly like calling navigate(path, options) from inside a
//   component.
// ─────────────────────────────────────────────────────────────

let navigatorRef = null;

// Called once, inside the Router context. See App.jsx.
export const setNavigator = (navigateFn) => {
  navigatorRef = navigateFn;
};

// Called from anywhere, including outside React (axios interceptors).
export const redirectTo = (path, options) => {
  if (navigatorRef) {
    navigatorRef(path, options);
  } else {
    // Fallback — should only trigger if something calls this before
    // the app has fully mounted, which should not happen in practice.
    window.location.href = path;
  }
};