import React from "react";
import { Link } from "react-router";
import logo from "../src/assets/only_logo.png"; // adjust path if your file is elsewhere

export const CommonFooter = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <Link to="/" className="site-footer-logo" aria-label="Econo Shop home">
          <img src={logo} alt="" className="site-footer-logo-image" />
          <span className="site-footer-logo-text">
            <strong>Econo Shop</strong>
            <small>Management System</small>
          </span>
        </Link>

        <p className="site-footer-about">
          Quality products, clear pricing and reliable delivery. Browse the
          catalog, save your favourites and order with confidence.
        </p>

        <div className="site-footer-bottom">
          © {new Date().getFullYear()} Econo Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
};