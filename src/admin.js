import { supabase } from './config.js';
import './index.css';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('product-form');
  const fileInput = document.getElementById('media-upload');
  const previewContainer = document.getElementById('preview-container');
  const statusMessage = document.getElementById('status-message');
  
  if (!form) return;
  
  const submitBtn = form.querySelector('button[type="submit"]');
  
  let base64Images = [];

  const waPaste = document.getElementById('wa-paste');
  if (waPaste) {
    waPaste.addEventListener('input', (e) => {
      const text = e.target.value.trim();
      if (!text) return;
      
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length === 0) return;
      
      // Name: Assume first line is the product name
      const nameInput = document.getElementById('name');
      if (lines[0] && !lines[0].match(/^(price|category|description)/i)) {
        nameInput.value = lines[0];
      }
      
      // Extract Price
      const priceInput = document.getElementById('price');
      const priceRegex = /(?:price|rs\.?|mrp|\$|₹)\s*[:\-]?\s*([\d,]+(?:\.\d+)?)/i;
      const priceMatch = text.match(priceRegex);
      if (priceMatch) {
        priceInput.value = priceMatch[1].replace(/,/g, '');
      }
      
      // Extract Category
      const catInput = document.getElementById('category');
      const catRegex = /(?:category|type)\s*[:\-]\s*(.+)/i;
      const catMatch = text.match(catRegex);
      if (catMatch) {
        const extracted = catMatch[1].trim().toLowerCase();
        if (extracted.includes('cloth') || extracted.includes('apparel') || extracted.includes('shirt') || extracted.includes('jeans')) {
          catInput.value = 'Clothing';
        } else {
          catInput.value = 'Watches';
        }
      } else {
        catInput.value = 'Watches'; // default
      }
      
      // Extract Description
      const descInput = document.getElementById('description');
      const descRegex = /(?:description|desc|details)\s*[:\-]\s*([\s\S]+)/i;
      const descMatch = text.match(descRegex);
      if (descMatch) {
        descInput.value = descMatch[1].trim();
      } else {
        // Use all lines except first as description if no explicit marker
        descInput.value = lines.slice(1).join('\n');
      }
    });
  }

  // Handle file selection and Base64 conversion
  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        base64Images.push(base64String);
        
        // Add to preview
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `<img src="${base64String}" alt="Preview">`;
        previewContainer.appendChild(previewItem);
      };
      reader.readAsDataURL(file);
    });
  });

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    statusMessage.className = 'status-message';
    statusMessage.textContent = '';
    
    try {
      const name = document.getElementById('name').value;
      const description = document.getElementById('description').value;
      const price = parseFloat(document.getElementById('price').value);
      const category = document.getElementById('category').value;
      
      const { error } = await supabase
        .from('products')
        .insert([
          { 
            name, 
            description, 
            price, 
            category, 
            media_base64: base64Images 
          }
        ]);
        
      if (error) throw error;
      
      // Success
      statusMessage.className = 'status-message success';
      statusMessage.textContent = 'Product added successfully!';
      
      // Reset form
      form.reset();
      if (waPaste) waPaste.value = '';
      base64Images = [];
      previewContainer.innerHTML = '';
      loadProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      statusMessage.className = 'status-message error';
      statusMessage.textContent = 'Failed to save product: ' + err.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Product';
    }
  });


  // Load and render product list
  const productListContainer = document.getElementById('product-list');
  const productListContent = document.querySelector('#product-list .product-list-content');

  async function loadProducts() {
    const { data, error } = await supabase.from('products').select().order('id', { ascending: false });
    if (error) {
      console.error('Error loading products:', error);
      return;
    }
    renderProducts(data);
  }

  function renderProducts(products) {
    if (!productListContent) return;
    productListContent.innerHTML = '';
    products.forEach(p => {
      const item = document.createElement('div');
      item.className = 'product-item';
      item.dataset.id = p.id;
      const imagesHtml = (p.media_base64 || []).map(src => `<img src="${src}" class="product-thumb" alt="Product image">`).join('');
      item.innerHTML = `
        <h3>${p.name}</h3>
        <p>${p.category} – ₹${p.price}</p>
        <p>${p.description}</p>
        <div class="product-images">${imagesHtml}</div>
        <button class="btn-edit">Edit</button>
        <button class="btn-delete">Delete</button>
      `;
      productListContent.appendChild(item);
    });
  }

  // Edit and Delete handlers
  productListContent?.addEventListener('click', async e => {
    if (e.target.classList.contains('btn-edit')) {
      const item = e.target.closest('.product-item');
      const id = item.dataset.id;
      // Fetch product details
      const { data, error } = await supabase.from('products').select().eq('id', id).single();
      if (error) return console.error('Fetch for edit error:', error);
      document.getElementById('name').value = data.name;
      document.getElementById('category').value = data.category;
      document.getElementById('price').value = data.price;
      document.getElementById('description').value = data.description;
      document.getElementById('product-id').value = data.id;
      submitBtn.textContent = 'Update Product';
    }
    if (e.target.classList.contains('btn-delete')) {
      const item = e.target.closest('.product-item');
      const id = item.dataset.id;
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) console.error('Delete error:', error);
      else loadProducts();
    }
  });

  // Initial load of products
  loadProducts();
});
