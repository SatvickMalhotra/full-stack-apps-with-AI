import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const featuredProducts = products.filter(p => p.featured);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-season">'25 winter collection</span>
            <span className="hero-status">live now</span>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <h2 className="section-title">Featured Collection</h2>
          <div className="products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* All Products */}
      <section className="all-products-section">
        <div className="container">
          <h2 className="section-title">Shop Collection</h2>
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="about-preview">
        <div className="container">
          <div className="about-content">
            <h2>Crafted for Style, Made for You</h2>
            <p>
              We believe in creating timeless pieces that blend comfort with contemporary design.
              Each piece in our collection is carefully curated to bring you the best in quality and style.
            </p>
            <button className="cta-btn">Explore Our Story</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
