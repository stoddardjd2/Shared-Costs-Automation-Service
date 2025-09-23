import React, { useEffect, useState } from "react";

const FixedBackgroundSection = ({ children }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile devices
    setIsMobile(window.innerWidth <= 768);

    const handleScroll = () => {
      if (!isMobile) {
        setScrollY(window.scrollY);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);
/* Rectangle 7 */

  console.log("isMobile",isMobile)
  return (
    <div
      className={`relative ${!isMobile ? "bg-scroll-gradient" : "[background:radial-gradient(50%_100%_at_50%_100%,#ACACAC_0%,#075C7B_0.01%,#022B3A_0.02%,#0C0C0C_100%)]"}`}
      style={{
        minHeight: "100vh",
        ...(isMobile
          ? {}
          : {
              backgroundAttachment: "fixed",
              // transform: `translateY(${scrollY * 0.5}px)`, // Parallax effect
            }),
      }}
    >
      {children}
    </div>
  );
};

export default FixedBackgroundSection;
