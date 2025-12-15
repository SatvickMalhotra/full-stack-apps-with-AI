import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { getCartCount, toggleCart } = useCart();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <span className="logo-text">CRAY</span>
        </Link>

        <ul className="nav-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/shop/unisex">Shop All</Link></li>
          <li><Link to="/reviews">Reviews</Link></li>
          <li><Link to="/about">About Us</Link></li>
        </ul>

        <div className="nav-actions">
          <button className="search-btn" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <button className="cart-btn" onClick={toggleCart} aria-label="Shopping cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 2L7 6H21L19 2H9z"/>
              <path d="M7 6L5 20H19L17 6"/>
              <circle cx="9" cy="20" r="1"/>
              <circle cx="15" cy="20" r="1"/>
            </svg>
            {getCartCount() > 0 && (
              <span className="cart-count">{getCartCount()}</span>
            )}
          </button>
          <button className="user-btn" aria-label="User account">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="8" r="4"/>
              <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
