import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE SETUP ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminDashboard({ products, onLogout }) {
  // --- FORM STATE ---
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [badge, setBadge] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(''); // Keeps track of old image when editing
  const [isUploading, setIsUploading] = useState(false);

  // --- EDIT STATE ---
  const [editingId, setEditingId] = useState(null);

  // Load a product into the form for editing
  const handleEditClick = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setSku(product.sku);
    setBadge(product.badge || '');
    setExistingImageUrl(product.image_url || '');
    setImageFile(null); // Clear any pending new file
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top form
  };

  // Cancel editing mode
  const handleCancelEdit = () => {
    setEditingId(null);
    setName(''); setCategory(''); setSku(''); 
    setExistingImageUrl(''); setImageFile(null); setBadge('');
  };

  // --- SUBMIT (ADD or UPDATE) ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    // Default to the existing image if they didn't upload a new one
    let finalImageUrl = existingImageUrl || null;

    try {
      // Step A: If they selected a NEW file, upload it
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
          
        finalImageUrl = data.publicUrl;
      }

      // Step B: Determine if we are ADDING (POST) or UPDATING (PUT)
      const endpoint = editingId 
        ? `https://jai-mata-di-hardware.onrender.com/api/products/${editingId}` 
        : 'https://jai-mata-di-hardware.onrender.com/api/products';
        
      const method = editingId ? 'PUT' : 'POST';

      // Step C: Send the data
      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          category: category,
          sku: sku,
          image_url: finalImageUrl,
          badge: badge || null 
        })
      });

      if (response.ok) {
        alert(editingId ? "Product Updated Successfully! Refresh to see changes." : "Product Added Successfully! Refresh to see it.");
        handleCancelEdit(); // Clears form and resets state
      } else {
        alert("Server error while saving. Check backend.");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Check console.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- DELETE ---
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product? This cannot be undone.");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`https://jai-mata-di-hardware.onrender.com/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert("Product Deleted! Refresh the page to see changes.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // --- INLINE DARK THEME STYLES ---
  const inputStyle = {
    background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', 
    padding: '0.9rem', borderRadius: '8px', width: '100%', outline: 'none',
    fontSize: '0.95rem', colorScheme: 'dark'
  };

  const selectStyle = {
    ...inputStyle, // Inherit all the good stuff from inputStyle
    appearance: 'none', // Hides the ugly default browser arrow
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    // Draws a beautiful, custom colored chevron arrow
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center', // Perfectly pads the arrow from the right edge
    backgroundSize: '1em',
    paddingRight: '2.5rem', // Prevents your text from overlapping the new arrow
    cursor: 'pointer'
  };

  const thStyle = {
    padding: '1rem', textAlign: 'left', color: '#94a3b8', 
    fontWeight: '600', borderBottom: '2px solid #334155', textTransform: 'uppercase', fontSize: '0.85rem'
  };

  const tdStyle = {
    padding: '1rem', borderBottom: '1px solid #334155', color: '#cbd5e1', verticalAlign: 'middle'
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* HEADER */}
      <header style={{ 
        background: 'linear-gradient(to right, #7f1d1d, #450a0a)', 
        padding: '2.5rem', borderRadius: '16px', marginBottom: '2.5rem', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        border: '1px solid #991b1b', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
      }}>
        <div>
          <h1 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '2rem' }}>SECURE ADMIN PORTAL</h1>
          <p style={{ color: '#fca5a5', margin: 0, fontWeight: '500', letterSpacing: '1px' }}>Inventory Management System</p>
        </div>
        <button onClick={onLogout} style={{ 
          background: '#0b0f19', color: 'white', border: '1px solid #334155', 
          padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' 
        }}>
          Exit & Return to Store
        </button>
      </header>

      {/* FORM: ADD OR EDIT */}
      <div style={{ 
        background: editingId ? '#1e3a8a' : '#1e293b', /* Changes color slightly when editing */
        padding: '2.5rem', borderRadius: '16px', border: editingId ? '2px solid #3b82f6' : '1px solid #334155', 
        marginBottom: '3rem', transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: '#f8fafc', margin: 0 }}>
            {editingId ? "✏️ Edit Product Details" : "➕ Add New Item"}
          </h2>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} style={{ background: '#334155', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
              Cancel Edit
            </button>
          )}
        </div>
        
        <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ color: '#94a3b8', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Product Name</label>
            <input type="text" placeholder="e.g., 12-inch Hacksaw Blade" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={{ color: '#94a3b8', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Category</label>
            <input type="text" placeholder="e.g., Tools" value={category} onChange={(e) => setCategory(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={{ color: '#94a3b8', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>SKU (Stock Keeping Unit)</label>
            <input type="text" placeholder="e.g., HKS-123" value={sku} onChange={(e) => setSku(e.target.value)} required style={inputStyle} />
          </div>
          
          <div>
            <label style={{ color: '#94a3b8', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Highlight Badge (Optional)</label>
              <select value={badge} onChange={(e) => setBadge(e.target.value)} style={selectStyle}>
              <option value="" style={{ background: '#0f172a', color: '#f8fafc' }}>None</option>
              <option value="Best Seller" style={{ background: '#0f172a', color: '#f8fafc' }}>🏆 Best Seller</option>
              <option value="Limited Stock" style={{ background: '#0f172a', color: '#f8fafc' }}>⚠️ Limited Stock</option>
            </select>
          </div>

          {/* CUSTOM FILE UPLOAD UI */}
          <div>
            <label style={{ color: '#94a3b8', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Product Image</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <label htmlFor="file-upload" style={{
                display: 'block', background: '#0f172a', color: imageFile ? '#10b981' : '#94a3b8',
                border: imageFile ? '1px solid #10b981' : '1px dashed #475569', 
                padding: '0.9rem', borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                fontWeight: '500', transition: 'all 0.2s', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {imageFile ? `📁 ${imageFile.name}` : (existingImageUrl ? "🖼️ Keep Existing Image or Click to Change" : "📁 Click to Choose Image...")}
              </label>
              <input id="file-upload" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={{ display: 'none' }} />
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <button type="submit" disabled={isUploading} style={{ 
              background: editingId ? '#3b82f6' : '#f59e0b', /* Blue for update, Orange for add */
              color: editingId ? 'white' : '#0f172a', 
              border: 'none', width: '100%', padding: '1.2rem', borderRadius: '8px', 
              fontWeight: 'bold', fontSize: '1.1rem', cursor: isUploading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}>
              {isUploading ? "⏳ Saving to Database..." : (editingId ? "Update Product Details" : "Save Product to Database")}
            </button>
          </div>
        </form>
      </div>

      {/* DATA TABLE VIEW */}
      <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', background: '#0f172a' }}>
          <h2 style={{ color: '#f8fafc', margin: 0 }}>📦 Active Inventory ({products.length} Items)</h2>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#1e293b' }}>
              <tr>
                <th style={thStyle}>Image</th>
                <th style={thStyle}>SKU</th>
                <th style={thStyle}>Product Name</th>
                <th style={thStyle}>Category</th>
                <th style={{...thStyle, textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={{ 
                  background: editingId === product.id ? '#1e3a8a' : 'transparent', /* Highlight row being edited */
                  transition: 'background 0.2s' 
                }} onMouseOver={(e) => { if(editingId !== product.id) e.currentTarget.style.background = '#334155' }} onMouseOut={(e) => { if(editingId !== product.id) e.currentTarget.style.background = 'transparent' }}>
                  <td style={tdStyle}>
                    {product.image_url ? (
                      <img src={product.image_url} alt="thumb" style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #475569' }} />
                    ) : (
                      <div style={{ width: '50px', height: '50px', borderRadius: '6px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#64748b', border: '1px solid #334155' }}>N/A</div>
                    )}
                  </td>
                  <td style={{...tdStyle, fontWeight: 'bold', color: '#94a3b8'}}>{product.sku}</td>
                  <td style={{...tdStyle, color: '#f8fafc', fontWeight: '500'}}>{product.name}</td>
                  <td style={tdStyle}>
                    <span style={{ background: '#0f172a', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', color: '#f59e0b', border: '1px solid #334155' }}>
                      {product.category}
                    </span>
                  </td>
                  <td style={{...tdStyle, textAlign: 'right'}}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEditClick(product)} style={{ 
                        background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', 
                        borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' 
                      }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(product.id)} style={{ 
                        background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '0.5rem 1rem', 
                        borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' 
                      }}>
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No products found in the database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}