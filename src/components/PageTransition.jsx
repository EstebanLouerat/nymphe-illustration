// src/components/PageTransition.jsx
import { useLocation } from "react-router-dom";
import "./PageTransition.css";

/**
 * Wraps page content with a smooth enter animation on every route change.
 * Uses React's key prop to force remount → triggers CSS animation on each navigation.
 */
function PageTransition({ children }) {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="page-transition"
    >
      {children}
    </div>
  );
}

export default PageTransition;
