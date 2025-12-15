# Clothing Brand WebApp

A modern, responsive e-commerce web application for urban/street style clothing brands. Built with React 19 and Vite, featuring product browsing, shopping cart, customer reviews, and a sleek user experience.

## Overview

This web app was designed for a clothing brand client to showcase their urban streetwear collection. It provides a complete e-commerce experience with product catalog, shopping cart, and customer reviews - all wrapped in a modern, mobile-first design.

### Key Highlights

- **Modern Stack** - React 19 + Vite for blazing fast performance
- **Mobile First** - Fully responsive design for all devices
- **Complete E-commerce** - Browse, cart, checkout flow ready
- **Customer Reviews** - Built-in review system with ratings
- **Easy to Customize** - Simple product data structure for easy updates

## Features

### Shopping Experience
- **Homepage** with hero banner and featured collection
- **Product Catalog** with category filtering
- **Product Detail Pages** with size selection and reviews
- **Shopping Cart** with sliding sidebar, quantity adjustment

### Product Management
- 12+ curated products (Polos, Hoodies, Sweaters, Jackets)
- Multiple size options (XS to XXL)
- Customer ratings and reviews per product
- Featured products showcase

### User Interface
- Clean, modern design inspired by contemporary fashion brands
- Smooth animations and transitions
- Intuitive navigation with React Router
- Responsive grid layouts

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19 |
| Build Tool | Vite 7 |
| Routing | React Router DOM 7 |
| State Management | Context API |
| Styling | CSS3 (Flexbox, Grid) |

## Project Structure

```
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.jsx      # Navigation bar with cart icon
│   │   ├── Cart.jsx        # Sliding cart sidebar
│   │   └── ProductCard.jsx # Product display card
│   ├── pages/              # Page components
│   │   ├── Home.jsx        # Landing page with hero
│   │   ├── Shop.jsx        # Category filtered shop
│   │   ├── ProductDetail.jsx # Single product view
│   │   ├── Reviews.jsx     # Customer reviews page
│   │   └── About.jsx       # Brand story page
│   ├── context/            # React Context
│   │   └── CartContext.jsx # Shopping cart state
│   ├── data/               # Product data
│   │   └── products.js     # Product catalog
│   ├── App.jsx             # Main app with routing
│   └── main.jsx            # Entry point
├── public/                 # Static assets
├── index.html              # HTML template
└── package.json
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero banner, featured & all products |
| Shop | `/shop/:category` | Filtered product views |
| Product | `/product/:id` | Product details, sizes, add to cart |
| Reviews | `/reviews` | Customer testimonials |
| About | `/about` | Brand story and values |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/SatvickMalhotra/full-stack-apps-with-AI.git
cd "Clothing Brand WebApp(Urban street style clothing web app)"
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open browser at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## Shopping Cart Features

- Add products with selected sizes
- Adjust quantities (+/-)
- Remove items from cart
- View total price in INR
- Slide-in sidebar interface
- Cart count badge on navbar

## Product Data Structure

Products are stored in `src/data/products.js`:

```javascript
{
  id: 1,
  name: "Vintage Navy Polo",
  price: 2499,              // INR
  category: "unisex",
  image: "image-url",
  sizes: ["S", "M", "L", "XL"],
  description: "Product description",
  material: "100% Cotton",
  featured: true,
  rating: 4.3,
  reviewCount: 127,
  reviews: [...]
}
```

## Customization

### Adding Products
Add new products to `src/data/products.js` following the structure above.

### Changing Colors
Edit CSS files to modify the color scheme:
- Primary accent colors in component CSS
- Gradients and hover effects

### Adding Categories
Update the Shop component and product data to include new categories.

## Future Enhancements

- [ ] User authentication
- [ ] Payment integration (Razorpay/Stripe)
- [ ] Wishlist functionality
- [ ] Product search & filters
- [ ] Order history
- [ ] Admin panel
- [ ] Inventory tracking
- [ ] Email notifications

## License

Private - Built for client project

## Author

Built with AI assistance for a clothing brand client.
