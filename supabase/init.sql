-- Create products table
CREATE TABLE public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  category text,
  media_base64 jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Public Read Access" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Admin Write Access" 
ON public.products 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create function for updating timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_products_modtime
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
