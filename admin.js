import products from './products.js';

/**
 * Urban Drip - Admin Dashboard & Parser Bot
 */

// Globals
let currentImageBase64 = "";
let customProducts = [];

// DOM Elements
const rawMessageInput = document.getElementById("raw-message");
const btnParseMessage = document.getElementById("btn-parse-message");

const productImageFile = document.getElementById("product-image-file");
const imageDragArea = document.getElementById("image-drag-area");
const imagePlaceholder = document.getElementById("image-placeholder");
const imagePreview = document.getElementById("image-preview");

const productForm = document.getElementById("product-form");
const productNameInput = document.getElementById("product-name");
const productCategorySelect = document.getElementById("product-category");
const productPriceInput = document.getElementById("product-price");
const productNumericPriceInput = document.getElementById("product-numeric-price");
const productDescriptionInput = document.getElementById("product-description");

const specsListContainer = document.getElementById("specs-list-container");
const btnAddSpec = document.getElementById("btn-add-spec");
const btnDownloadDatabase = document.getElementById("btn-download-database");
const btnClearAll = document.getElementById("btn-clear-all");
const inventoryTableBody = document.getElementById("inventory-table-body");

// Default Placeholder Image
const DEFAULT_PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";

/**
 * Initialize Dashboard
 */
function init() {
  loadCustomProducts();
  renderInventoryTable();
  setupEventListeners();
  addSpecRow("", ""); // Add one empty spec row by default
}

/**
 * Load products from localStorage
 */
function loadCustomProducts() {
  const stored = localStorage.getItem("ud_custom_products");
  if (stored) {
    try {
      customProducts = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse custom products", e);
      customProducts = [];
    }
  } else {
    customProducts = [];
  }
}

/**
 * Save products to localStorage
 */
function saveCustomProducts() {
  localStorage.setItem("ud_custom_products", JSON.stringify(customProducts));
  renderInventoryTable();
}

/**
 * Setup Interaction Event Listeners
 */
function setupEventListeners() {
  // Parsing trigger
  btnParseMessage.addEventListener("click", runMessageParserBot);

  // Specs trigger
  btnAddSpec.addEventListener("click", () => addSpecRow("", ""));

  // Image Drag & Drop triggers
  imageDragArea.addEventListener("click", () => productImageFile.click());
  imageDragArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    imageDragArea.style.borderColor = "var(--accent-gold)";
    imageDragArea.style.background = "var(--accent-gold-glow)";
  });
  imageDragArea.addEventListener("dragleave", () => {
    imageDragArea.style.borderColor = "var(--border-light)";
    imageDragArea.style.background = "transparent";
  });
  imageDragArea.addEventListener("drop", (e) => {
    e.preventDefault();
    imageDragArea.style.borderColor = "var(--border-light)";
    imageDragArea.style.background = "transparent";
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProductImage(e.dataTransfer.files[0]);
    }
  });

  productImageFile.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleProductImage(e.target.files[0]);
    }
  });

  // Submit Uploader Form
  productForm.addEventListener("submit", handleFormSubmit);

  // Clear Custom Products database
  btnClearAll.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all custom products from localStorage?")) {
      customProducts = [];
      saveCustomProducts();
    }
  });

  // Download compiled database file
  btnDownloadDatabase.addEventListener("click", downloadProductsJSFile);
}

/**
 * File Reader converting image to Base64 data URI
 */
function handleProductImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    currentImageBase64 = e.target.result;
    imagePreview.src = currentImageBase64;
    imagePreview.style.display = "block";
    imagePlaceholder.style.display = "none";
  };
  reader.readAsDataURL(file);
}

/**
 * Specs Dynamic Row Creator
 */
function addSpecRow(key = "", val = "") {
  const row = document.createElement("div");
  row.className = "spec-row";
  row.style.display = "flex";
  row.style.gap = "0.5rem";
  row.style.marginBottom = "0.5rem";

  row.innerHTML = `
    <input type="text" class="spec-key" placeholder="Key (e.g. Case Size)" value="${key}" style="flex: 1;">
    <input type="text" class="spec-value" placeholder="Value (e.g. 42mm)" value="${val}" style="flex: 1;">
    <button type="button" class="spec-del-btn" style="padding: 0.7rem; background: rgba(255, 0, 0, 0.15); color: #ff5c5c; border: 1px solid rgba(255,0,0,0.3); border-radius: 8px; cursor: pointer; transition: all 0.2s;">×</button>
  `;

  row.querySelector(".spec-del-btn").addEventListener("click", () => {
    row.remove();
  });

  specsListContainer.appendChild(row);
}

/**
 * Clear Specs Panel
 */
function clearSpecRows() {
  specsListContainer.innerHTML = "";
}

/**
 * Uploader Form Submission Handler
 */
function handleFormSubmit(e) {
  e.preventDefault();

  const name = productNameInput.value.trim();
  const category = productCategorySelect.value;
  const price = productPriceInput.value.trim();
  const numericPrice = parseFloat(productNumericPriceInput.value) || 0;
  const description = productDescriptionInput.value.trim();

  // Build specifications object
  const specs = {};
  document.querySelectorAll(".spec-row").forEach(row => {
    const key = row.querySelector(".spec-key").value.trim();
    const val = row.querySelector(".spec-value").value.trim();
    if (key && val) {
      specs[key] = val;
    }
  });

  // Image validation
  const imageSource = currentImageBase64 || DEFAULT_PLACEHOLDER_IMG;

  const newProduct = {
    id: "custom_" + Date.now(),
    name,
    category,
    price,
    numericPrice,
    description,
    media: [
      { type: "image", url: imageSource }
    ],
    specs
  };

  customProducts.push(newProduct);
  saveCustomProducts();

  // Reset form inputs & file visualizer
  productForm.reset();
  clearSpecRows();
  addSpecRow("", ""); // Reset default empty spec row
  rawMessageInput.value = "";
  currentImageBase64 = "";
  imagePreview.style.display = "none";
  imagePlaceholder.style.display = "flex";

  alert("Product uploaded successfully to catalog website!");
}

/**
 * WhatsApp message Auto-Parser Bot (Enhanced Power Version)
 */
function runMessageParserBot() {
  const text = rawMessageInput.value.trim();
  if (!text) {
    alert("Please paste a text message first!");
    return;
  }

  console.log("Parsing message:", text);

  // 1. Detect Category
  let category = "watches"; // Default
  const watchKeywords = ["watch", "dial", "chrono", "automatic", "caliber", "bezel", "strap", "horology", "wrist", "rolex", "patek", "omega", "seiko", "casio", "timepiece", "quartz", "smartwatch"];
  const clothingKeywords = ["shirt", "hoodie", "pants", "coat", "jacket", "linen", "terry", "apparel", "clothing", "fabric", "cotton", "suit", "blazer", "wear", "t-shirt", "jeans", "denim", "sweater", "sneakers", "shoes", "boots", "cap", "hat", "accessory"];

  let watchMatches = 0;
  let clothingMatches = 0;

  watchKeywords.forEach(kw => {
    const regex = new RegExp("\\b" + kw + "s?\\b", "i");
    if (regex.test(text)) watchMatches++;
  });

  clothingKeywords.forEach(kw => {
    const regex = new RegExp("\\b" + kw + "s?\\b", "i");
    if (regex.test(text)) clothingMatches++;
  });

  if (clothingMatches > watchMatches) {
    category = "clothing";
  }
  productCategorySelect.value = category;

  // 2. Parse Price
  let displayPrice = "";
  let numericPrice = 0;

  // Search for currency format like $1,250 or Rs. 1500 or 1500 USD or 1500 INR
  const currencyRegex = /(?:price|prize|rate|cost|mrp)?\s*[:\-]?\s*(?:\$|Rs\.?|₹|EUR|INR|USD)?\s?(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:INR|USD)?/i;
  const matchCurrency = text.match(currencyRegex);

  if (matchCurrency) {
    const valString = matchCurrency[1].replace(/,/g, "");
    numericPrice = parseFloat(valString) || 0;
    
    // Set appropriate prefix
    if (text.includes("$") || text.includes("USD")) {
      displayPrice = "$" + numericPrice.toLocaleString();
    } else if (text.match(/Rs\.?|₹|INR/i)) {
      displayPrice = "₹" + numericPrice.toLocaleString();
    } else {
      displayPrice = "$" + numericPrice.toLocaleString();
    }
  } else {
    // Lookup plain numbers above 10 (fallback)
    const numberRegex = /\b(\d{2,6})\b/;
    const matchNumber = text.match(numberRegex);
    if (matchNumber) {
      numericPrice = parseFloat(matchNumber[1]) || 0;
      displayPrice = "₹" + numericPrice.toLocaleString(); // default to ₹ based on user's phone numbers
    }
  }

  if (displayPrice) {
    productPriceInput.value = displayPrice;
    productNumericPriceInput.value = numericPrice;
  }

  // Split into lines and remove empty ones or "forwarded" headers
  const lines = text.split(/\n/).map(l => l.trim()).filter(l => l.length > 0 && !/forwarded message/i.test(l));

  // 3. Parse Name (usually the first non-empty line)
  let name = "";
  let descriptionLines = [...lines];

  if (lines.length > 0) {
    name = lines[0];
    
    // Clean name of price terms or specs
    name = name.replace(/(?:price|prize|rate|cost|is|\$|Rs\.?|₹|INR)\s?\d+(?:,\d{3})*(?:\.\d{2})?/gi, "").trim();
    // Strip ending punctuation, asterisks or hyphens
    name = name.replace(/^[.,;\-:\*!]+|[.,;\-:\*!]+$/g, "").trim();
    
    if (name.length > 2 && name.length < 80) {
      productNameInput.value = name;
      descriptionLines.shift(); // remove title from description
    } else {
       // Fallback to first sentence if it was a giant paragraph
       const sentences = name.split(/\.\s/);
       if (sentences[0].length < 80) {
          name = sentences[0];
          productNameInput.value = name.replace(/^[.,;\-:\*!]+|[.,;\-:\*!]+$/g, "").trim();
       }
    }
  }

  // 4. Parse Technical Specifications
  clearSpecRows();
  let specsFound = false;

  // Scan lines for ":" or "-" or "*" patterns (e.g. Size: Medium or Material - 100% Wool or *Color:* Black)
  const remainingDescLines = [];

  descriptionLines.forEach(line => {
    // Matches "Key : Value", "*Key*: Value", "Key - Value"
    const specRegex = /^\*?([A-Za-z\s]+)\*?\s*[:\-–—]\s*(.+)$/;
    const match = line.match(specRegex);
    
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim();
      
      // Exclude lines that are too long to be specs, or relate to price
      if (key.length < 30 && val.length < 80 && !/price|cost|buy|shop|rate/i.test(key)) {
        addSpecRow(key.replace(/^\*|\*$/g, ''), val.replace(/^\*|\*$/g, ''));
        specsFound = true;
        return; // Don't add to description
      }
    }
    
    // Check if line is just price info, and exclude from description
    if (/(?:price|prize|rate|cost|mrp)?\s*[:\-]?\s*(?:\$|Rs\.?|₹|EUR|INR|USD)?\s?(\d+(?:,\d{3})*(?:\.\d{2})?)/i.test(line)) {
      if (line.length < 40) return; // likely just a price line
    }

    remainingDescLines.push(line);
  });

  // Look for implicit sizing keywords if no explicit specs found
  if (!specsFound) {
    const sizeMatch = text.match(/\b(?:size|fit)\s?[:\-]?\s?([SML]|XL|XXL|small|medium|large)\b/i);
    if (sizeMatch) {
      addSpecRow("Size", sizeMatch[1].toUpperCase());
      specsFound = true;
    }

    const materialMatch = text.match(/\b(?:wool|linen|cotton|leather|silk|gold|steel|titanium|canvas|suede)\b/i);
    if (materialMatch) {
      addSpecRow("Material", materialMatch[0].charAt(0).toUpperCase() + materialMatch[0].slice(1));
      specsFound = true;
    }
  }

  if (!specsFound) {
    addSpecRow("", ""); // Add empty row fallback
  }

  // 5. Build Description
  let descText = remainingDescLines.join('\n');
  descText = descText.replace(/^\s+|\s+$/g, "");
  productDescriptionInput.value = descText;

  // Alert success
  const infoBubble = document.createElement("div");
  infoBubble.style.cssText = "position: fixed; top: 1.5rem; right: 1.5rem; background: var(--accent-gold); color: var(--bg-primary); padding: 1rem 1.5rem; border-radius: 12px; font-weight: 700; z-index: 1000; box-shadow: 0 10px 25px rgba(0,0,0,0.5);";
  infoBubble.textContent = "🚀 Super Parser Bot extracted details successfully!";
  document.body.appendChild(infoBubble);
  setTimeout(() => infoBubble.remove(), 2500);
}

/**
 * Render Inventory Table of Custom added items
 */
function renderInventoryTable() {
  inventoryTableBody.innerHTML = "";

  if (customProducts.length === 0) {
    inventoryTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No custom products uploaded in this browser yet. Use the uploader form above.
        </td>
      </tr>
    `;
    return;
  }

  customProducts.forEach(prod => {
    const mediaUrl = prod.media[0]?.url || DEFAULT_PLACEHOLDER_IMG;
    const specCount = Object.keys(prod.specs || {}).length;
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <img src="${mediaUrl}" alt="${prod.name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-light);">
      </td>
      <td style="font-weight: 600;">${prod.name}</td>
      <td><span class="product-category-tag" style="position: static; font-size: 0.7rem; padding: 0.2rem 0.5rem;">${prod.category}</span></td>
      <td style="color: var(--accent-gold); font-weight: 700;">${prod.price}</td>
      <td style="font-size: 0.85rem; color: var(--text-secondary);">
        ${prod.description.substring(0, 45)}... <br>
        <span style="font-size: 0.75rem; color: var(--text-muted);">${specCount} specifications added</span>
      </td>
      <td style="text-align: right;">
        <button class="delete-prod-btn" data-id="${prod.id}" style="padding: 0.4rem 0.8rem; background: rgba(255, 0, 0, 0.15); color: #ff5c5c; border: 1px solid rgba(255,0,0,0.2); border-radius: 6px; cursor: pointer; transition: all 0.2s;">Delete</button>
      </td>
    `;

    tr.querySelector(".delete-prod-btn").addEventListener("click", () => {
      if (confirm(`Remove "${prod.name}" from catalog?`)) {
        customProducts = customProducts.filter(item => item.id !== prod.id);
        saveCustomProducts();
      }
    });

    inventoryTableBody.appendChild(tr);
  });
}

/**
 * Package database as downloadable products.js
 */
function downloadProductsJSFile() {
  // Load initial hardcoded list from imported products
  const originalProducts = products || [];
  
  // Exclude custom products from duplicate rendering if already merged in memory
  // Filter original list for items that don't start with "custom_"
  const originalCleanList = originalProducts.filter(p => !p.id.startsWith("custom_"));
  
  // Combine lists
  const combined = [...originalCleanList, ...customProducts];

  const fileHeader = `/**\n * Urban Drip - Product Inventory Database\n * Auto-generated on ${new Date().toISOString()}\n */\n\n`;
  const codeContent = fileHeader + `const products = ${JSON.stringify(combined, null, 2)};\n\n` +
`// Export standard for both browser global and module environments\n` +
`if (typeof module !== 'undefined' && module.exports) {\n` +
`  module.exports = products;\n` +
`} else {\n` +
`  window.products = products;\n}\n`;

  // Create virtual link download trigger
  const blob = new Blob([codeContent], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "products.js";
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Run setup
document.addEventListener("DOMContentLoaded", init);
