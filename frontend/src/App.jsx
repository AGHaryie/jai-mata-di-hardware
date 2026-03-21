import React, { useState, useEffect } from 'react';

function App() {
  // Set up state to hold the products from Python
  const [products, setProducts] = useState([]);

// Fetch data when the page loads
  useEffect(() => {
    fetch('https://jai-mata-di-hardware.onrender.com/api/products')
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto text-center py-16 px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Jai Mata Di <span className="text-blue-600">Hardware</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Wholesale distributor of premium hacksaw blades and quality bathroom fittings. Partner with us for reliable B2B supply.
          </p>
        </div>
      </div>

      {/* Dynamic Product Catalog Section */}
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b-2 border-blue-600 inline-block pb-2">
          Featured Products
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Loop through the dynamic products fetched from Python */}
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 font-medium text-sm">Image Coming Soon</span>
              </div>
              <div className="p-6">
                <p className="text-sm text-blue-600 font-semibold mb-1 uppercase tracking-wider">{product.category}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-4">SKU: {product.sku}</p>
                <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded shadow-sm transition duration-200">
                  Inquire Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;