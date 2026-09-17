/* =========================================
   Sphere Football Academy — Shop products

   Add, remove, or update products here. Put product photos in images/shop/
   and reference them with paths like images/shop/home-jersey.png.
   ========================================= */

/* =========================================
   AVAILABLE FIELDS
   ────────────────────────────────────────────────────────────────────────
   id          (required)  Unique slug, used in URLs and cart
   name        (required)  Display name shown on card and detail page
   price       (required)  Number in dollars (no currency symbol)
   category    (required)  Used for filter tabs: "Apparel", "Headwear", "Equipment"
   image       (required)  Path to the main product image (e.g. "images/shop/cap.png")
   sizes       (required)  Array of size strings shown in the size picker
   short       (required)  One-liner product description
   note        (optional)  Highlighted product note shown on the detail page
   material    (optional)  Array of strings, shown as bullet list in detail view
   fit         (optional)  Array of strings describing the fit
   fitNote     (optional)  Extra sizing note shown below fit info (e.g. "Size up for a relaxed feel")
   images      (optional)  Array of {src, alt, label} for multi-image carousel with arrows
   colors      (optional)  Array of hex strings for color swatches and the detail page
                         colour picker. Must pair with images.
   available   (optional)  Set to false to show a "COMING SOON" ribbon. Omit or true = normal
   ========================================= */

window.SPHERE_PRODUCTS = [
  {
    id: "match-kit-combo",
    name: "Sphere Match Kit Combo",
    price: 100,
    // available: false,
    category: "Apparel",
    image: "images/shop/match-kit-combo.png",
    images: [
      {
        src: "images/shop/match-kit-combo.png",
        alt: "Match Kit Combo with jersey, shorts and socks",
        label: "Combo",
      },
    ],
    sizes: ["Youth S", "Youth M", "Youth L", "Youth XL"],
    short: "Complete match kit bundle with jersey, shorts and socks.",
  },
  {
    id: "match-jersey",
    name: "Sphere Match Jersey",
    price: 50,
    // available: false,
    category: "Apparel",
    image: "images/shop/match-jersey.png",
    images: [
      {
        src: "images/shop/match-jersey.png",
        alt: "Match Jersey 25/26 front view",
        label: "Front",
      },
      {
        src: "images/shop/match-jersey-back.png",
        alt: "Match Jersey 25/26 back view",
        label: "Back",
      },
    ],
    sizes: ["Youth S", "Youth M", "Youth L", "Youth XL"],
    short: "Sphere Match Jersey",
  },
  {
    id: "match-shorts",
    name: "Sphere Match Shorts",
    price: 35,
    // available: false,
    category: "Apparel",
    image: "images/shop/sphere-match-shorts.png",
    images: [
      {
        src: "images/shop/sphere-match-shorts.png",
        alt: "Home Jersey 25/26 front view",
        label: "Front",
      },
    ],
    sizes: ["Youth S", "Youth M", "Youth L", "Youth XL"],
    short: "Sphere Match Shorts",
  },
  {
    id: "match-socks",
    name: "Match Socks",
    price: 20,
    // available: false,
    category: "Apparel",
    image: "images/shop/match-socks-white.png",
    images: [
      {
        src: "images/shop/match-socks-white.png",
        alt: "Match Socks White",
        label: "white",
      },
    ],
    sizes: ["Men's S", "Men's M", "Men's L", "Men's XL", "Men's XXL"],
    short: "Match Socks",
  },
  {
    id: "training-kit-combo",
    name: "Sphere Training Kit Combo",
    price: 100,
    // available: false,
    category: "Apparel",
    image: "images/shop/training-kit-combo.png",
    images: [
      {
        src: "images/shop/training-kit-combo.png",
        alt: "Training Kit Combo with jersey, shorts and socks",
        label: "Combo",
      },
    ],
    sizes: ["Youth S", "Youth M", "Youth L", "Youth XL"],
    short:
      "Complete training kit bundle with training jersey, shorts and socks.",
  },
  {
    id: "training-jersey",
    name: "Sphere Training Jersey",
    price: 50,
    // available: false,
    category: "Apparel",
    image: "images/shop/training-jersey-blue.png",
    images: [
      {
        src: "images/shop/training-jersey-blue.png",
        alt: "Training Jersey front view",
        label: "Front",
      },
      {
        src: "images/shop/training-jersey-back-blue.png",
        alt: "Training Jersey back view",
        label: "Back",
      },
    ],
    sizes: ["Youth S", "Youth M", "Youth L", "Youth XL"],
    short: "Sphere Training Jersey",
  },
  {
    id: "training-shorts",
    name: "Sphere Training Shorts",
    price: 35,
    // available: false,
    category: "Apparel",
    image: "images/shop/training-shorts-blue.png",
    sizes: ["Men's S", "Men's M", "Men's L", "Men's XL", "Men's XXL"],
    short: "Sphere Training Shorts",
  },
  {
    id: "training-socks",
    name: "Training Socks",
    price: 20,
    // available: false,
    category: "Apparel",
    image: "images/shop/training-socks-blue.png",
    sizes: ["Youth S", "Youth M", "Youth L", "Youth XL"],
    short: "Training Socks",
  },
  {
    id: "training-pants",
    name: "Sphere Training Pants",
    price: 75,
    //available: false,
    category: "Apparel",
    image: "images/shop/sphere-training-pants-front.png",
    sizes: [
      "Youth S",
      "Youth M",
      "Youth L",
      "Youth XL",
      "Men's S",
      "Men's M",
      "Men's L",
      "Men's XL",
      "Men's XXL",
    ],
    short: "Tapered training pants with zip cuffs.",
    images: [
      {
        src: "images/shop/sphere-training-pants-front.png",
        alt: "Hoodie black",
        label: "Black",
      },
      {
        src: "images/shop/sphere-training-pants-back.png",
        alt: "Training Pants",
        label: "Blue",
      },
    ],
  },
  {
    id: "cotton-hoodie",
    name: "Cotton Hoodie",
    price: 80,
    //available: false,
    category: "Apparel",
    image: "images/shop/sphere-cotton-hoodie-black-front.jpg",
    images: [
      {
        src: "images/shop/sphere-cotton-hoodie-black-front.jpg",
        alt: "Hoodie black",
        label: "Black",
      },
      {
        src: "images/shop/sphere-cotton-hoodie-blue-front.jpg",
        alt: "Cotton Hoodie blue",
        label: "Blue",
      },
      {
        src: "images/shop/sphere-cotton-hoodie-grey-front.jpg",
        alt: "Hoodie grey",
        label: "Grey",
      },
    ],
    sizes: [
      "Youth S",
      "Youth M",
      "Youth L",
      "Youth XL",
      "Men's S",
      "Men's M",
      "Men's L",
      "Men's XL",
      "Men's XXL",
    ],
    colors: ["#222", "#1a75d2", "#6b7280"],
    short: "Heavyweight hoodie for cold mornings on the training ground.",
  },
  {
    id: "sphere-therma",
    name: "Sphere Therma Repel Jacket",
    price: 135,
    //available: false,
    category: "Apparel",
    image: "images/shop/sphere-youth-therma-jacket-front.png",
    images: [
      {
        src: "images/shop/sphere-youth-therma-jacket-front.png",
        alt: "Therma Repel Jacket",
        label: "Navey",
      },
      {
        src: "images/shop/sphere-youth-therma-jacket-back.png",
        alt: "Therma Repel Jacket",
        label: "Navey",
      },
    ],
    sizes: [
      "Youth S",
      "Youth M",
      "Youth L",
      "Youth XL",
      "Men's S",
      "Men's M",
      "Men's L",
      "Men's XL",
      "Men's XXL",
    ],
    short: "Therma Repel Park Jacket ",
  },
  {
    id: "therma-puffer",
    name: "Sphere Therma Puffer Jacket",
    price: 240,
    //available: false,
    category: "Apparel",
    image: "images/shop/sphere-therma-fit-puffer-front.png",
    images: [
      {
        src: "images/shop/sphere-therma-fit-puffer-front.png",
        alt: "Sphere Therma Puffer Jacket",
        label: "Black",
      },
      {
        src: "images/shop/sphere-therma-fit-puffer-back.png",
        alt: "Therma Repel Jacket",
        label: "Navey",
      },
    ],
    sizes: ["Men's S", "Men's M", "Men's L", "Men's XL", "Men's XXL"],
    short: "Sphere Therma Puffer Jacket",
    note: "Men’s sizes only. Not available in youth sizes.",
  },
  {
    id: "sphere-gilet",
    name: "Sphere Gilet",
    price: 130,
    //available: false,
    category: "Apparel",
    image: "images/shop/spere-gilet-front.png",
    images: [
      {
        src: "images/shop/spere-gilet-front.png",
        alt: "Sphere Gilet",
        label: "Navy",
      },
    ],
    sizes: ["Men's S", "Men's M", "Men's L", "Men's XL", "Men's XXL"],
    short: "Therma Repel Park Jacket ",
    note: "Men’s sizes only. Not available in youth sizes.",
  },
  {
    id: "1/4 ZIP",
    name: "1/4 ZIP",
    price: 95,
    //available: false,
    category: "Apparel",
    image: "images/shop/1_4zip-front.png",
    images: [
      {
        src: "images/shop/1_4zip-front.png",
        alt: "1/4 ZIP front view",
        label: "Front",
      },
      {
        src: "images/shop/1_4zip-back.png",
        alt: "1/4 ZIP back view",
        label: "Back",
      },
    ],
    sizes: ["Men's S", "Men's M", "Men's L", "Men's XL", "Men's XXL"],
    short: "Heavyweight hoodie for cold mornings on the training ground.",
    note: "Men’s sizes only. Not available in youth sizes.",
  },
  {
    id: "full-zip-hoodie",
    name: "Sphere Training Full Zip Hoodie",
    price: 105,
    //available: false,
    category: "Apparel",
    image: "images/shop/training-full-zip-jhoodie-front.png",
    images: [
      {
        src: "images/shop/training-full-zip-jhoodie-front.png",
        alt: "Sphere Training Full Zip Hoodie",
        label: "Front",
      },
      {
        src: "images/shop/training-full-zip-jhoodie-back.png",
        alt: "Sphere Training Full Zip Hoodie",
        label: "Back",
      },
    ],
    sizes: [
      "Youth S",
      "Youth M",
      "Youth L",
      "Youth XL",
      "Men's S",
      "Men's M",
      "Men's L",
      "Men's XL",
      "Men's XXL",
    ],
    short: "Sphere Training Full Zip Hoodie",
  },
  {
    id: "track-jacket",
    name: "Sphere Training Track Jacket",
    price: 80,
    //available: false,
    category: "Apparel",
    image: "images/shop/sphere-youth-training-jacket.png",
    images: [
      {
        src: "images/shop/sphere-youth-training-jacket.png",
        alt: "Sphere Training Track Jacket",
        label: "Front",
      },
    ],
    sizes: ["Youth S", "Youth M", "Youth L", "Youth XL"],
    short: "Sphere Training Track Jacket",
  },
  {
    id: "t-shirt",
    name: "T-Shirt",
    price: 60,
    // available: false,
    category: "Apparel",
    image: "images/shop/t-shirt-black.png",
    images: [
      {
        src: "images/shop/t-shirt-black.png",
        alt: "T-Shirt black",
        label: "Black",
      },
      {
        src: "images/shop/t-shirt-blue.png",
        alt: "T-Shirt blue",
        label: "Blue",
      },
      {
        src: "images/shop/t-shirt-white.png",
        alt: "T-Shirt white",
        label: "White",
      },
    ],
    sizes: ["Men's S", "Men's M", "Men's L", "Men's XL", "Men's XXL"],
    colors: ["#222", "#1a75d2", "#fff"],
    short: "Everyday tee with Sphere branding. Soft cotton, clean fit.",
  },
  {
    id: "sphere-cap",
    name: "Sphere Cap",
    price: 45,
    // available: false,
    category: "Headwear",
    image: "images/shop/sphere-cap.png",
    sizes: ["One Size"],
    short: "Six-panel cap with adjustable strap.",
  },
  {
    id: "beanie",
    name: "Winter Beanie",
    price: 50,
    //available: false,
    category: "Headwear",
    image: "images/shop/sphere-beanie-front.png",
    sizes: ["One Size"],
    short: "Cuffed beanie. Warm enough for winter sessions.",
    images: [
      {
        src: "images/shop/sphere-beanie-front.png",
        alt: "T-Shirt black",
        label: "Black",
      },
      {
        src: "images/shop/sphere-beanie-back.png",
        alt: "T-Shirt blue",
        label: "Blue",
      },
    ],
  },
  {
    id: "sphere-backpack",
    name: "Sphere Backpack",
    price: 75,
    //available: false,
    category: "Equipment",
    image: "images/shop/sphere-backpack.png",
    sizes: ["30L"],
    short: "Sphere Football Academy backpack.",
  },
];
