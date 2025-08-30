import React, { useState, useEffect } from "react";

const TypingEffect = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText(""); // Reset on text change
    if (text) {
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText((prev) => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, speed);
      return () => clearInterval(typingInterval);
    }
  }, [text, speed]);

  return (
    <p className="mt-2 text-cyber-blue">
      {displayedText}
      <span className="animate-ping">_</span>
    </p>
  );
};

export default TypingEffect;
