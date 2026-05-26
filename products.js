const products = [
  {
    id: "w1",
    name: "Chronos Gold Skeleton",
    category: "watches",
    price: "$2,450",
    numericPrice: 2450,
    description: "Experience the art of mechanical engineering on your wrist. The Chronos Gold Skeleton features a fully exposed automatic movement, housed in a polished 18k yellow gold-plated stainless steel chassis, complemented by an exhibition case back and a hand-stitched alligator leather strap.",
    media: [
      { type: "image", url: "https://images.unsplash.com/photo-1619134778706-7015533a6150?auto=format&fit=crop&w=800&q=80" },
      { type: "video", url: "https://assets.mixkit.co/videos/preview/mixkit-luxury-wrist-watch-in-detail-40436-large.mp4" },
      { type: "image", url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80" }
    ],
    specs: {
      "Case Size": "42mm",
      "Movement": "Caliber 8215 Automatic (Self-Winding)",
      "Dial Color": "Skeletonized Gold",
      "Strap Material": "Genuine Alligator Leather",
      "Water Resistance": "5 ATM (50 meters)"
    }
  },
  {
    id: "w2",
    name: "Apex Eclipse Chronograph",
    category: "watches",
    price: "$1,890",
    numericPrice: 1890,
    description: "An embodiment of stealth and sophistication. The Apex Eclipse boasts a matte black DLC-coated titanium case with a triple-subdial chronograph layout. Designed for those who seek high-performance precision without sacrificing elegant, minimalist aesthetics.",
    media: [
      { type: "image", url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=800&q=80" },
      { type: "image", url: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80" }
    ],
    specs: {
      "Case Size": "44mm",
      "Movement": "Swiss Quartz Chronograph",
      "Dial Color": "Matte Obsidian Black",
      "Strap Material": "Reinforced Fluorocarbon Rubber",
      "Water Resistance": "10 ATM (100 meters)"
    }
  },
  {
    id: "w3",
    name: "Classic Heritage Minimalist",
    category: "watches",
    price: "$950",
    numericPrice: 950,
    description: "Understated elegance at its finest. The Classic Heritage strips away the noise to leave a pure, legible, and timeless design. A polished silver case paired with a crisp white dial and sleek silver hands, secured by a supple tan calfskin leather strap.",
    media: [
      { type: "image", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" },
      { type: "image", url: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80" }
    ],
    specs: {
      "Case Size": "39mm",
      "Movement": "Slim Japanese Quartz",
      "Dial Color": "Opaline Silver-White",
      "Strap Material": "Premium Calfskin Leather (Tan)",
      "Water Resistance": "3 ATM (30 meters)"
    }
  },
  {
    id: "c1",
    name: "Italian Wool Overcoat",
    category: "clothing",
    price: "$720",
    numericPrice: 720,
    description: "Crafted from double-faced virgin Italian wool, this overcoat offers exceptional warmth and a beautifully draped silhouette. Featuring unstructured shoulders, a three-button front closure, and deep patch pockets, it bridges the gap between formal tailoring and casual luxury.",
    media: [
      { type: "image", url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80" },
      { type: "image", url: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80" }
    ],
    specs: {
      "Material": "85% Virgin Wool, 15% Cashmere",
      "Fit": "Tailored / Relaxed Drape",
      "Lining": "100% Cupro (Sleeves only)",
      "Origin": "Made in Italy",
      "Care": "Dry Clean Only"
    }
  },
  {
    id: "c2",
    name: "Linen Resort Collar Shirt",
    category: "clothing",
    price: "$180",
    numericPrice: 180,
    description: "The ultimate warm-weather essential. Spun from long-staple French flax, this shirt is pre-washed for an incredibly soft feel and a natural, relaxed crinkle. Cut with a modern camp (resort) collar and a straight hem, perfect for casual outings or beachside lounging.",
    media: [
      { type: "image", url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80" },
      { type: "image", url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80" }
    ],
    specs: {
      "Material": "100% Organic French Linen",
      "Fit": "Regular / Breathable",
      "Collar": "Camp / Resort Collar",
      "Weave": "Lightweight Plain Weave",
      "Care": "Machine Wash Cold, Hang Dry"
    }
  },
  {
    id: "c3",
    name: "Signature Gold-Embroidered Hoodie",
    category: "clothing",
    price: "$340",
    numericPrice: 340,
    description: "Elevate your streetwear collection. Knitted from heavy 450gsm organic cotton loopback French terry, this hoodie features our signature emblem embroidered in high-luster gold thread on the chest. Designed with a double-layered hood, dropped shoulders, and ribbed side panels.",
    media: [
      { type: "image", url: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=800&q=80" },
      { type: "video", url: "https://assets.mixkit.co/videos/preview/mixkit-man-under-colored-lights-wearing-a-hoodie-42289-large.mp4" },
      { type: "image", url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80" }
    ],
    specs: {
      "Material": "100% Organic Cotton French Terry (450gsm)",
      "Fit": "Oversized / Boxy",
      "Detailing": "Metallic Gold Silk Embroidery",
      "Hardware": "Custom Engraved Gold-Tone Aglets",
      "Care": "Wash Inside Out on Gentle Cycle"
    }
  }
];

export default products;
