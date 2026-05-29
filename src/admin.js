import { supabase } from './config.js';
import './index.css';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('product-form');
  const fileInput = document.getElementById('media-upload');
  const previewContainer = document.getElementById('preview-container');
  const statusMessage = document.getElementById('status-message');
  
  if (!form) return;
  
  let base64Images = [];

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
    
    const submitBtn = form.querySelector('button[type="submit"]');
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
      base64Images = [];
      previewContainer.innerHTML = '';
      
    } catch (err) {
      console.error('Error saving product:', err);
      statusMessage.className = 'status-message error';
      statusMessage.textContent = 'Failed to save product: ' + err.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Product';
    }
  });
});
