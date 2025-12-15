import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About CRAY</h1>
        <p>Redefining streetwear, one piece at a time</p>
      </div>

      <div className="container">
        <section className="about-section">
          <div className="about-content">
            <h2>Our Story</h2>
            <p>
              Founded in 2020, CRAY emerged from a passion for creating clothing that speaks to the
              bold and the fearless. We believe fashion should be an expression of individuality,
              comfort, and confidence.
            </p>
            <p>
              Every piece in our collection is thoughtfully designed and crafted with premium materials
              to ensure you look good and feel even better. From vintage-inspired polos to contemporary
              streetwear, our designs capture the spirit of modern fashion while honoring timeless style.
            </p>
          </div>
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800"
              alt="Fashion design"
            />
          </div>
        </section>

        <section className="values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">✨</div>
              <h3>Quality First</h3>
              <p>
                We use only the finest materials and work with skilled artisans to ensure every
                piece meets our high standards.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">🌍</div>
              <h3>Sustainability</h3>
              <p>
                Committed to ethical production and sustainable practices to minimize our
                environmental footprint.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">🎨</div>
              <h3>Unique Design</h3>
              <p>
                Our in-house design team creates original pieces that stand out from the
                mainstream fashion crowd.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">💯</div>
              <h3>Customer First</h3>
              <p>
                Your satisfaction is our priority. We're here to make your shopping experience
                exceptional.
              </p>
            </div>
          </div>
        </section>

        <section className="team-section">
          <h2>Meet The Team</h2>
          <p className="team-intro">
            Behind CRAY is a passionate team of designers, creators, and fashion enthusiasts
            dedicated to bringing you the best in contemporary streetwear.
          </p>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">RM</div>
              <h3>Rohan Malhotra</h3>
              <p>Creative Director</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">PS</div>
              <h3>Priya Sharma</h3>
              <p>Lead Designer</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">AK</div>
              <h3>Arjun Kumar</h3>
              <p>Production Manager</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">NT</div>
              <h3>Neha Tiwari</h3>
              <p>Brand Manager</p>
            </div>
          </div>
        </section>

        <section className="contact-section">
          <h2>Get In Touch</h2>
          <p>Have questions? Want to collaborate? We'd love to hear from you!</p>
          <div className="contact-info">
            <div className="contact-item">
              <strong>Email:</strong> hello@craystore.com
            </div>
            <div className="contact-item">
              <strong>Phone:</strong> +91 98765 43210
            </div>
            <div className="contact-item">
              <strong>Address:</strong> 123 Fashion Street, Mumbai, India
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
