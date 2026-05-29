import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tztbgejokwbegfiaoram.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dGJnZWpva3diZWdmaWFvcmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3ODgzNzUsImV4cCI6MjA5NTM2NDM3NX0.MRaZ5I0vSPwqh4CV2oGw21m1VIZVjFttk8Hzjjco0PY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabase() {
  console.log("1. Testing SELECT...");
  const { data: selectData, error: selectError } = await supabase.from('products').select('*').limit(1);
  if (selectError) {
    console.error("SELECT ERROR:", selectError);
  } else {
    console.log("SELECT SUCCESS! Found rows:", selectData?.length);
  }

  console.log("\n2. Testing INSERT...");
  const newProduct = {
    id: "custom_" + Date.now(),
    name: "Test Insert Product",
    category: "watches",
    price: "$99",
    numericPrice: 99,
    description: "Testing Supabase insertion from backend",
    media: [
      { type: "image", url: "https://example.com/test.jpg" }
    ],
    specs: { "Test": "Test Spec" }
  };

  const { data: insertData, error: insertError } = await supabase.from('products').insert([newProduct]);
  if (insertError) {
    console.error("INSERT ERROR:");
    console.error(insertError);
  } else {
    console.log("INSERT SUCCESS!");
    console.log(insertData);
  }
}

testSupabase();
