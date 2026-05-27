export const SUPABASE_URL = "https://tztbgejokwbegfiaoram.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dGJnZWpva3diZWdmaWFvcmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3ODgzNzUsImV4cCI6MjA5NTM2NDM3NX0.MRaZ5I0vSPwqh4CV2oGw21m1VIZVjFttk8Hzjjco0PY";

export const CONFIG = {
  // Primary WhatsApp number (no +, include country code)
  whatsappPhone: "919601413428",
  // Secondary WhatsApp number (optional)
  whatsappPhone2: "916355421593",
  brandName: "Urban Drip",
  generalInquiryMsg: "Hello Urban Drip, I have a general inquiry.",
  buildProductMessage: (product) => {
    return `Hello Urban Drip, I'm interested in purchasing this product:\n\n` +
      `*Product:* ${product.name}\n` +
      `*Category:* ${product.category.toUpperCase()}\n` +
      `*Price:* ${product.price}\n\n` +
      `Could you please let me know if it's currently in stock? Thank you!`;
  }
};
