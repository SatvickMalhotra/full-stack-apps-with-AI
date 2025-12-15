import { reviews } from '../data/products';
import './Reviews.css';

const Reviews = () => {
  const averageRating = (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={index < rating ? 'star filled' : 'star'}>
        ★
      </span>
    ));
  };

  return (
    <div className="reviews-page">
      <div className="container">
        <div className="reviews-header">
          <h1>Customer Reviews</h1>
          <div className="rating-summary">
            <div className="average-rating">
              <span className="rating-number">{averageRating}</span>
              <div className="stars">{renderStars(5)}</div>
              <span className="total-reviews">Based on {reviews.length} reviews</span>
            </div>
          </div>
        </div>

        <div className="reviews-grid">
          {reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="reviewer-name">{review.name}</h3>
                    <p className="review-date">{new Date(review.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
              </div>
              <div className="review-product">
                <span>Product: {review.product}</span>
              </div>
              <p className="review-comment">{review.comment}</p>
              <div className="review-footer">
                <button className="helpful-btn">
                  👍 Helpful
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="write-review-section">
          <h2>Share Your Experience</h2>
          <p>We'd love to hear about your experience with our products!</p>
          <button className="write-review-btn">Write a Review</button>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
