import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        <div className="product-overlay">
          <span className="quick-view">Quick View</span>
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">Rs. {product.price.toLocaleString()}</p>
        <p className="product-category">{product.category.toUpperCase()}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
