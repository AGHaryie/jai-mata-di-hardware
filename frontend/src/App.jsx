import { useState, useEffect } from 'react';
import Chatbot from './Chatbot';
import AdminDashboard from './AdminDashboard';
import './App.css';

function App() {
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isChatOpen, setIsChatOpen] = useState(false); // Controls the AI Chat
  const [inquiryCount, setInquiryCount] = useState(0); // Holds the real DB count
  const [isBulkMode, setIsBulkMode] = useState(true); // Premium Bulk/Retail Toggle

  // State for the Individual Product Inquiry Modal
  const [inquiryProduct, setInquiryProduct] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // --- ADMIN AUTH STATE ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const SECRET_PIN = "Santosh@1234";

  // YOUR FATHER'S WHATSAPP NUMBER
  const WHATSAPP_NUMBER = "919811482950";

  // --- DATA FETCHING ---
  useEffect(() => {
    // 1. Fetch Products
    fetch('https://jai-mata-di-hardware.onrender.com/api/products')
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching data:', error));

    // 2. Fetch Inquiry Count
    fetch('https://jai-mata-di-hardware.onrender.com/api/inquiries/count')
      .then((response) => response.json())
      .then((data) => setInquiryCount(data.count))
      .catch((error) => console.error('Error fetching inquiry count:', error));
  }, []);

  // Dynamic Categories from Database
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filtering Logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // --- INQUIRY SUBMIT LOGIC (For single products) ---
  const handleInquirySubmit = async (e) => {
    e.preventDefault();

    try {
      await fetch('https://jai-mata-di-hardware.onrender.com/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: inquiryProduct.name,
          sku: inquiryProduct.sku,
          customer_name: customerName,
          customer_phone: customerPhone
        }),
      });
      console.log("Lead successfully saved to database!");
    } catch (error) {
      console.error("Error saving lead:", error);
    }

    const message = `Hello Jai Mata Di Hardware! I am ${customerName}. I would like to inquire about ${isBulkMode ? 'bulk' : 'retail'} pricing for: ${inquiryProduct.name} (SKU: ${inquiryProduct.sku}).`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setInquiryProduct(null);
    setCustomerName('');
    setCustomerPhone('');
  };

  const handleSecretLogin = () => {
    const enteredPin = prompt("Enter Admin PIN:");
    if (enteredPin === SECRET_PIN) {
      setIsAdminLoggedIn(true);
    } else if (enteredPin !== null) {
      alert("Incorrect PIN!");
    }
  };

  if (isAdminLoggedIn) {
    return <AdminDashboard products={products} onLogout={() => setIsAdminLoggedIn(false)} />;
  }

  return (
    <div className="app-container">

      {/* --- PREMIUM HERO HEADER --- */}
      <header className="hero-header">
        <h1>BULK HARDWARE.<br/>TRUSTED SUPPLY.</h1>
        <p>Best prices for contractors & wholesalers in Delhi</p>

        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => window.scrollTo({top: 500, behavior: 'smooth'})}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            Explore Products
          </button>
          {/* UPDATED: This button now triggers the AI Chatbot */}
          <button className="btn-secondary" onClick={() => setIsChatOpen(true)}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Get Quote
          </button>
        </div>
      </header>

      {/* --- SEARCH BAR (Dark Mode Style) --- */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="🔍 Search inventory by product name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
          style={{ width: '100%', background: '#0f172a', color: 'white', borderColor: '#334155' }}
        />
      </div>

      {/* --- PREMIUM NAVIGATION & MODE TOGGLE --- */}
      <div className="premium-nav-bar">
        <div className="nav-categories">
          {categories.slice(0, 5).map(category => (
            <button
              key={category}
              className={`nav-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'All' ? '🌐 All Inventory' : `🔧 ${category}`}
            </button>
          ))}
        </div>

        <div className="mode-toggle">
          <button
            className={`toggle-btn ${!isBulkMode ? 'active' : ''}`}
            onClick={() => setIsBulkMode(false)}
          >
            Retail Mode
          </button>
          <button
            className={`toggle-btn bulk ${isBulkMode ? 'active' : ''}`}
            onClick={() => setIsBulkMode(true)}
          >
            📦 Bulk Mode
          </button>
        </div>
      </div>

      {/* --- SECTION HEADER --- */}
      <div className="section-header">
        <h2>{isBulkMode ? "BULK DEALS" : "RETAIL CATALOG"} <span className="dots">...</span></h2>
        <div className="trust-ribbon">
          <span className="icon">🔥</span> {500 + inquiryCount}+ Wholesale Inquiries This Month
        </div>
      </div>

      {/* --- DARK DATA-RICH PRODUCT GRID --- */}
      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="dark-product-card">
              {/* Dynamic Admin-Controlled Badge */}
              {product.badge && (
                <div className={`badge ${product.badge === 'Best Seller' ? 'best-seller' : 'limited'}`}>
                  {product.badge === 'Best Seller' ? '🏆 BEST SELLER' : '⚠️ LIMITED STOCK'}
                </div>
              )}

              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="product-image" />
              ) : (
                <div className="card-image-placeholder"><span>No Image</span></div>
              )}

              <div className="card-content">
                <h3>{product.name}</h3>
                <p className="sku">SKU: {product.sku}</p>

                {/* Pricing UI Placeholder */}
                <div className="pricing-ui">
                  {isBulkMode ? (
                    <p className="bulk-price">
                      <span className="qty">Bulk Rate ➔</span>
                      <span className="unit">Request via WhatsApp</span>
                    </p>
                  ) : (
                    <p className="retail-price">
                      <span className="qty">Single ➔</span>
                      <span className="unit">Request via WhatsApp</span>
                    </p>
                  )}
                </div>

                <button
                  className="btn-whatsapp"
                  onClick={() => setInquiryProduct(product)}
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" style={{marginRight: '8px'}}><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.656.833 5.141 2.422 7.224L.812 24l4.912-1.286A11.93 11.93 0 0012.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zM17.56 16.29c-.234.661-1.375 1.276-1.896 1.344-.521.068-1.12.161-3.307-.745-2.63-1.094-4.328-3.766-4.458-3.938-.13-.172-1.062-1.411-1.062-2.687 0-1.276.661-1.906.896-2.14.234-.234.505-.292.677-.292.172 0 .344 0 .49.005.156.005.328-.063.51.375.188.443.646 1.583.703 1.698.057.115.094.245.016.396-.078.151-.115.245-.229.375-.115.13-.245.286-.344.385-.115.115-.24.24-.104.474.135.234.604 1.005 1.297 1.625.896.802 1.656 1.047 1.885 1.161.229.115.365.094.5-.057.135-.151.583-.677.74-9.911.156-.234.312-.198.521-.115.208.083 1.312.615 1.536.729.224.115.375.172.432.266.057.094.057.542-.177 1.203z"/></svg>
                  WhatsApp Inquiry
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results" style={{background: '#1e293b', color: '#94a3b8', border: '1px solid #334155'}}>No products found matching your search.</p>
        )}
      </div>

      {/* --- 5. WHY CHOOSE US & STATS SECTION --- */}
      <div className="stats-section">
        <div className="stats-left">
          <h2>Why Choose Us?</h2>
          <ul className="benefits-list">
            <li><svg width="24" height="24" fill="none" stroke="#10b981" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Genuine Products</li>
            <li><svg width="24" height="24" fill="none" stroke="#10b981" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Best Wholesale Pricing</li>
            <li><svg width="24" height="24" fill="none" stroke="#10b981" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Fast Delivery in Delhi</li>
            <li className="highlight"><svg width="24" height="24" fill="none" stroke="#10b981" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Trusted Since 2005</li>
          </ul>
        </div>

        <div className="stats-right">
          <div className="stats-grid">
            <div className="stat-box">
              <h3>📦 10k+</h3>
              <p>Orders Delivered</p>
            </div>
            <div className="stat-box">
              <h3>📍 500+</h3>
              <p>Trusted Clients</p>
            </div>
            <div className="stat-box">
              <h3>🏢 50+</h3>
              <p>Cities Served</p>
            </div>
          </div>

          <div className="live-notification">
            <div className="notif-content">
              <span className="flame">🔥</span>
              <p><strong>2 buyers</strong> are looking at <span>Hardware</span> right now</p>
            </div>
            <button className="btn-add-quote" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
               <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{marginRight: '6px'}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
               View Deals
            </button>
          </div>
        </div>
      </div>

      {/* --- 6. WAREHOUSE & CONTACT CARD --- */}
      <div className="warehouse-section">
        <div className="warehouse-text">
          <h2>Bulk Hardware?<br/>Get a Quote!</h2>
          <ul className="benefits-list" style={{marginTop: '1.5rem', marginBottom: '2rem'}}>
            <li><svg width="24" height="24" fill="none" stroke="#10b981" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Search, compare & get best bulk rates!</li>
            <li><svg width="24" height="24" fill="none" stroke="#10b981" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Visit our Chawri Baazar location</li>
          </ul>
          <a href="https://maps.google.com/?q=3740+New+Saini+Market+Hauz+Qazi+Delhi+110006" target="_blank" rel="noreferrer" style={{textDecoration: 'none'}}>
            <button className="btn-primary" style={{width: 'fit-content'}}>
              📍 Get Directions
            </button>
          </a>
        </div>

        <div className="map-card-wrapper">
          <div className="map-card">
            <div className="map-overlay">
              <h3>Visit Our Warehouse</h3>
              <p>Jai Mata Di Hardware<br/>3740, New Saini Market, Gali Charan Dass, Hauz Qazi, Chandni Chowk, Delhi 110006</p>
              <div className="map-rating">
                <span className="score">4.9</span>
                <span className="stars">⭐⭐⭐⭐⭐</span>
                <span className="reviews">(Verified Supplier)</span>
              </div>
            </div>
            <div className="map-image-bg" style={{backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')"}}>
              <div className="map-pin">📍</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- PREMIUM FOOTER --- */}
      <footer className="premium-footer">
        <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,10 90,80 10,80" fill="none" stroke="#ef4444" strokeWidth="4" />
            <polygon points="10,30 90,30 50,100" fill="none" stroke="#ef4444" strokeWidth="4" />
            <text x="50" y="63" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#ef4444" textAnchor="middle">माँ</text>
          </svg>
          <div>
            <h2>JAI MATA DI</h2>
            <p>HARDWARE</p>
          </div>
        </div>

        <div className="footer-links">
          {/* Styled Email Link */}
          <a href="mailto:santoshjmdjmd1@gmail.com" className="contact-link">
            ✉️ santoshjmdjmd1@gmail.com
          </a>
        </div>

        <div className="footer-contact">
          {/* Clickable Phone Number using tel: */}
          <a href="tel:+919811482950" className="phone-link">
            📞 +91 9811482950
          </a>

          {/* Clickable WhatsApp Button */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="whatsapp-tag"
            style={{textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px'}}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.656.833 5.141 2.422 7.224L.812 24l4.912-1.286A11.93 11.93 0 0012.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zM17.56 16.29c-.234.661-1.375 1.276-1.896 1.344-.521.068-1.12.161-3.307-.745-2.63-1.094-4.328-3.766-4.458-3.938-.13-.172-1.062-1.411-1.062-2.687 0-1.276.661-1.906.896-2.14.234-.234.505-.292.677-.292.172 0 .344 0 .49.005.156.005.328-.063.51.375.188.443.646 1.583.703 1.698.057.115.094.245.016.396-.078.151-.115.245-.229.375-.115.13-.245.286-.344.385-.115.115-.24.24-.104.474.135.234.604 1.005 1.297 1.625.896.802 1.656 1.047 1.885 1.161.229.115.365.094.5-.057.135-.151.583-.677.74-9.911.156-.234.312-.198.521-.115.208.083 1.312.615 1.536.729.224.115.375.172.432.266.057.094.057.542-.177 1.203z"/></svg>
            WhatsApp
          </a>
        </div>
      </footer>

      {/* --- INDIVIDUAL PRODUCT INQUIRY MODAL --- */}
      {inquiryProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{background: '#1e293b', border: '1px solid #334155', color: 'white'}}>
            <h3 style={{color: 'white', marginBottom: '1rem'}}>WhatsApp Inquiry</h3>
            <p className="modal-product-name" style={{color: '#f59e0b'}}>{inquiryProduct.name}</p>
            <p className="modal-sku" style={{color: '#94a3b8', marginBottom: '1.5rem'}}>SKU: {inquiryProduct.sku}</p>

            <form onSubmit={handleInquirySubmit}>
              <input
                type="text"
                placeholder="Your Name / Business Name"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="modal-input"
                style={{background: '#0f172a', color: 'white', borderColor: '#475569'}}
              />
              <input
                type="tel"
                placeholder="Your WhatsApp Number"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="modal-input"
                style={{background: '#0f172a', color: 'white', borderColor: '#475569'}}
              />
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setInquiryProduct(null)} style={{background: '#334155', color: 'white'}}>Cancel</button>
                <button type="submit" className="submit-btn">Open WhatsApp</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- NEW: AI CHATBOT MODAL --- */}
      {isChatOpen && (
        <Chatbot
          onClose={() => setIsChatOpen(false)}
          whatsappNumber={WHATSAPP_NUMBER}
        />
      )}

      {/* SECRET ADMIN TRIGGER */}
      <div
        onClick={handleSecretLogin}
        style={{ textAlign: 'center', padding: '2rem', color: '#0b0f19', cursor: 'default' }}
      >
        π
      </div>
    </div>
  );
}

export default App;
