
import React from 'react';

interface NavbarProps {
  brandName: string;
  links: { label: string; href: string }[];
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ brandName, links, className }) => {
  return (
    <nav className={`navbar ${className}`}>
      <a href="/" className="navbar-brand">
        {brandName}
      </a>
      <ul className="navbar-nav">
        {links.map((link, index) => (
          <li key={index} className="nav-item">
            <a href={link.href} className="nav-link">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
