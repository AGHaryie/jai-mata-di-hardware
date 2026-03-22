import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // State for the Inquiry Modal
  const [inquiryProduct, setInquiryProduct] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // YOUR FATHER'S WHATSAPP NUMBER (include country code, no + or spaces)
  const WHATSAPP_NUMBER = "919811482950"; 

  // --- DATA FETCHING ---
  useEffect(() => {
    fetch('https://jai-mata-di-hardware.onrender.com/api/products')
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // --- INQUIRY SUBMIT LOGIC ---
  const handleInquirySubmit = async (e) => {
    e.preventDefault();

    // 1. Open WhatsApp with pre-filled message immediately
    const message = `Hello Jai Mata Di Hardware! I am ${customerName}. I would like to inquire about bulk pricing for: ${inquiryProduct.name} (SKU: ${inquiryProduct.sku}).`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // 2. Save to DB (Optional: we can connect this to the Python backend later!)
    console.log("Saving to DB:", { product: inquiryProduct.name, customerName, customerPhone });

    // 3. Close Modal & Clear Form
    setInquiryProduct(null);
    setCustomerName('');
    setCustomerPhone('');
  };

  return (
    <div className="app-container">
      
      {/* HEADER */}
      <header className="header">
        <h1>Jai Mata Di Hardware</h1>
        <p>Premium B2B Catalog</p>
      </header>

      {/* CONTROLS */}
      <div className="controls">
        <input 
          type="text" 
          placeholder="Search by name or SKU..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-filter"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* PRODUCT GRID */}
      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="card-image-placeholder">
                <span>No Image</span>
              </div>
              <div className="card-content">
                <span className="category-badge">{product.category}</span>
                <h2>{product.name}</h2>
                <p className="sku">SKU: {product.sku}</p>
                
                {/* NEW INQUIRE BUTTON */}
                <button 
                  className="inquire-btn" 
                  onClick={() => setInquiryProduct(product)}
                >
                  Inquire on WhatsApp
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">No products found.</p>
        )}
      </div>

      {/* CONTACT SECTION */}
      <section className="contact-section">
        <div className="contact-header">
          <h2>Contact & Location</h2>
          <p>Get in touch for wholesale inquiries and bulk orders</p>
        </div>
        <div className="contact-grid">
          <div className="contact-details">
            <div className="contact-item">
              <h3>📍 Visit Our Store</h3>
              <p>Jai Mata Di Hardware, 3740, New Saini Market, Gali Charan Dass, Chawri Baazar, North Delhi, Manohar Market, Hauz Qazi, Chandni Chowk, Area, New Delhi, Delhi 110006</p>
            </div>
            <div className="contact-item">
              <h3>📞 Call Us</h3>
              <p>+91 9811482950</p>
            </div>
            <div className="contact-item">
              <h3>✉️ Email</h3>
              <p>santoshjmdjmd1@gmail.com</p>
            </div>
          </div>
          <div className="map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.3179970504098!2d77.22706497572058!3d28.65019567565506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd182d1cf255%3A0xeaaf61437229f5ca!2sJai%20Mata%20Di%20Hardware!5e0!3m2!1sen!2sin!4v1774126341506!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>
      </section>

      {/* INQUIRY MODAL (Hidden until button is clicked) */}
      {inquiryProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Inquire About Item</h3>
            <p className="modal-product-name">{inquiryProduct.name}</p>
            <p className="modal-sku">SKU: {inquiryProduct.sku}</p>
            
            <form onSubmit={handleInquirySubmit}>
              <input 
                type="text" 
                placeholder="Your Name / Business Name" 
                required 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="modal-input"
              />
              <input 
                type="tel" 
                placeholder="Your WhatsApp Number" 
                required 
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="modal-input"
              />
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setInquiryProduct(null)}>Cancel</button>
                <button type="submit" className="submit-btn">Open WhatsApp</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;