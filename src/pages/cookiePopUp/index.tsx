import { useEffect, useState } from "react";
import "./style.css";

const CookiePopup = () => {
  const [visible, setVisible] = useState<boolean>(() => {
    return !localStorage.getItem("cookieAccepted");
  });

  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(() => {
        setVisible(false);
      }, 15000); // auto-dismiss after 15s
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  const handleAccept = () => {
    localStorage.setItem("cookieAccepted", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-popup">
      <div className="cookie-popup-content">
        <p className="cookie-text">
          🍪 We use cookies to improve your experience. By using this site, you agree to our
          <a
            href="/privacy-policy"
            className="cookie-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            Cookie Policy
          </a>.
        </p>
        <button onClick={handleAccept} className="cookie-accept-button">
          Accept
        </button>
      </div>
    </div>
  );
};

export default CookiePopup;
