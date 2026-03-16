import React, { useState, useEffect } from "react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "40px",
            height: "40px",
            backgroundColor: "#4154f1",
            border: "none",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
            transition: "all 0.4s",
            zIndex: 999,
            padding: 0,
            opacity: isVisible ? 1 : 0,
            visibility: isVisible ? "visible" : "hidden",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#6776f4"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#4154f1"
          }}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="3"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      )}
    </>
  );
};

export default ScrollToTopButton;