import React from "react";

const FixedBackgroundSection = ({children}) => {
  return (
    <div
      className={`relative
      //  bg-scroll-gradient
       `}
      style={{
        minHeight: "100vh",
        backgroundAttachment: "fixed",
      }}
    >
   {children}
    </div>
  );
};

export default FixedBackgroundSection;
