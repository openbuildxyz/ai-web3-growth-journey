import React from "react";

function Footer() {
  return (
    <footer className="bg-black bg-opacity-30 mt-12">
      <div className="container mx-auto px-6 py-6 text-center text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} DeFiGuard AI. All rights reserved.
        </p>
        <p className="text-sm mt-1">
          This is a tool for informational purposes only. Always do your own
          research.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
