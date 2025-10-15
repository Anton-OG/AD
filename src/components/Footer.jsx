// src/components/Footer.jsx
import React from "react";
import "./styles/Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" role="contentinfo">
      © {year} UrsaCortex Diagnostics
    </footer>
  );
}
