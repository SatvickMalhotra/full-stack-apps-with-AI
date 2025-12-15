import { useParams } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import './Shop.css';

const Shop = () => {
  const { category } = useParams();

  const filteredProducts = category === 'all'
    ? products
    : products.filter(p => p.category === category);

  const title = category === 'all'
    ? 'All Products'
    : `${category.charAt(0).toUpperCase() + category.slice(1)}'s Collection`;

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h1>{title}</h1>
        <p>{filteredProducts.length} products available</p>
      </div>

      <div className="container">
        <div className="products-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="no-products">
            <p>No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
