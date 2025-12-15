import { stats } from '../data/products';
import './Statistics.css';

const Statistics = () => {
  return (
    <div className="statistics-page">
      <div className="container">
        <div className="stats-header">
          <h1>Business Statistics</h1>
          <p>Overview of our store performance and analytics</p>
        </div>

        {/* Key Metrics */}
        <div className="key-metrics">
          <div className="metric-card">
            <div className="metric-icon">📦</div>
            <div className="metric-info">
              <h3>Total Sales</h3>
              <p className="metric-value">{stats.totalSales.toLocaleString()}</p>
              <span className="metric-label">Products Sold</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">💰</div>
            <div className="metric-info">
              <h3>Revenue</h3>
              <p className="metric-value">Rs. {(stats.totalRevenue / 100000).toFixed(1)}L</p>
              <span className="metric-label">Total Earnings</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">👥</div>
            <div className="metric-info">
              <h3>Customers</h3>
              <p className="metric-value">{stats.totalCustomers.toLocaleString()}</p>
              <span className="metric-label">Happy Shoppers</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">👕</div>
            <div className="metric-info">
              <h3>Products</h3>
              <p className="metric-value">{stats.totalProducts}</p>
              <span className="metric-label">In Catalog</span>
            </div>
          </div>
        </div>

        {/* Monthly Sales Chart */}
        <div className="chart-section">
          <h2>Monthly Sales Trend</h2>
          <div className="chart-container">
            <div className="bar-chart">
              {stats.monthlySales.map((data, index) => {
                const maxSales = Math.max(...stats.monthlySales.map(m => m.sales));
                const height = (data.sales / maxSales) * 100;
                return (
                  <div key={index} className="bar-wrapper">
                    <div
                      className="bar"
                      style={{ height: `${height}%` }}
                      title={`${data.month}: ${data.sales} sales`}
                    >
                      <span className="bar-value">{data.sales}</span>
                    </div>
                    <span className="bar-label">{data.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="top-products-section">
          <h2>Top Selling Products</h2>
          <div className="top-products-list">
            {stats.topSellingProducts.map((product, index) => (
              <div key={index} className="top-product-item">
                <div className="rank">#{index + 1}</div>
                <div className="product-info-stat">
                  <h3>{product.name}</h3>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(product.sold / stats.topSellingProducts[0].sold) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
                <div className="sold-count">{product.sold} sold</div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="additional-stats">
          <div className="stat-box">
            <h3>Average Order Value</h3>
            <p className="stat-value">Rs. {Math.round(stats.totalRevenue / stats.totalSales).toLocaleString()}</p>
          </div>

          <div className="stat-box">
            <h3>Conversion Rate</h3>
            <p className="stat-value">12.5%</p>
          </div>

          <div className="stat-box">
            <h3>Customer Satisfaction</h3>
            <p className="stat-value">4.8 / 5.0</p>
          </div>

          <div className="stat-box">
            <h3>Repeat Customers</h3>
            <p className="stat-value">68%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
