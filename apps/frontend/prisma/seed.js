
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

async function seedProducts() {
  try {

    await prisma.products.create({
      data: {
        title: "Leather Messenger Bag",
        description: "Premium full-grain leather messenger bag perfect for professionals and students. Features multiple compartments, adjustable shoulder strap, and durable construction. Ideal for laptops up to 15 inches and everyday essentials.",
        url: "https://picsum.photos/id/7",
        price: 8999 // $89.99
      },
    });

    await prisma.products.create({
      data: {
        title: "College Textbook Bundle",
        description: "Essential textbook collection for college students including mathematics, science, and literature classics. Great condition with minimal highlighting. Perfect for supplemental learning or reference materials.",
        url: "https://picsum.photos/id/20",
        price: 12499 // $124.99
      },
    });

    await prisma.products.create({
      data: {
        title: "Women's Running Sneakers",
        description: "High-performance running shoes with advanced cushioning technology and breathable mesh upper. Designed for comfort during long runs and daily wear. Available in classic white with stylish accents.",
        url: "https://picsum.photos/id/21",
        price: 14999 // $149.99
      },
    });

    await prisma.products.create({
      data: {
        title: "Vintage Literature Collection",
        description: "Rare collection of classic American literature including first editions and signed copies. Features works by renowned authors and makes an excellent addition to any book collector's library.",
        url: "https://picsum.photos/id/24",
        price: 29999 // $299.99
      },
    });

    await prisma.products.create({
      data: {
        title: "Artisan Coffee Mug",
        description: "Handcrafted ceramic coffee mug made by local artisans. Features unique glazing and ergonomic design. Perfect for your morning coffee or tea. Microwave and dishwasher safe.",
        url: "https://picsum.photos/id/30",
        price: 1899 // $18.99
      },
    });

    await prisma.products.create({
      data: {
        title: "Premium Motor Oil Case",
        description: "High-quality synthetic motor oil for automotive maintenance. Full case of 12 quarts, suitable for multiple oil changes. Meets all industry standards and extends engine life.",
        url: "https://picsum.photos/id/34",
        price: 7999 // $79.99
      },
    });

    await prisma.products.create({
      data: {
        title: "Photography Equipment Kit",
        description: "Professional camera accessories including lenses, filters, tripod, and carrying case. Perfect for both amateur and professional photographers. Compatible with most DSLR cameras.",
        url: "https://picsum.photos/id/36",
        price: 49999 // $499.99
      },
    });

    await prisma.products.create({
      data: {
        title: "Vintage Turntable",
        description: "Restored vintage record player with modern components. Features belt drive, adjustable tonearm, and built-in preamp. Perfect for vinyl enthusiasts and music lovers.",
        url: "https://picsum.photos/id/39",
        price: 39999 // $399.99
      },
    });

    await prisma.products.create({
      data: {
        title: "Dining Room Table Set",
        description: "Solid wood dining table with matching chairs. Seats up to 6 people comfortably. Classic American craftsmanship with modern functionality. Perfect for family dinners and entertaining.",
        url: "https://picsum.photos/id/42",
        price: 129999 // $1,299.99
      },
    });

    await prisma.products.create({
      data: {
        title: "MacBook Pro 16-inch",
        description: "Latest Apple MacBook Pro with M3 chip, 16GB RAM, and 512GB SSD. Perfect for creative professionals, developers, and power users. Includes original packaging and accessories.",
        url: "https://picsum.photos/id/48",
        price: 249999 // $2,499.99
      },
    });

    await prisma.products.create({
      data: {
        title: "Cape Cod Lighthouse Model",
        description: "Detailed replica of famous New England lighthouse. Handcrafted with authentic materials and LED lighting. Perfect for coastal home decor or maritime enthusiasts.",
        url: "https://picsum.photos/id/58",
        price: 89999 // $899.99
      },
    });

    await prisma.products.create({
      data: {
        title: "Gaming Setup Bundle",
        description: "Complete computer gaming setup including high-performance PC, mechanical keyboard, gaming mouse, and RGB lighting. Ready for streaming and competitive gaming.",
        url: "https://picsum.photos/id/60",
        price: 179999 // $1,799.99
      },
    });

    await prisma.products.create({
      data: {
        title: "Artisan Tea Set",
        description: "Beautiful handcrafted tea set with teapot, cups, and saucers. Made from fine porcelain with traditional American pottery techniques. Perfect for afternoon tea or special occasions.",
        url: "https://picsum.photos/id/60",
        price: 599 // $5.99
      },
    });

    await prisma.products.create({
      data: {
        title: "Wireless Gaming Controller",
        description: "Premium wireless controller compatible with PC, Xbox, and mobile devices. Features haptic feedback, customizable buttons, and long battery life. Perfect for all gaming genres.",
        url: "https://picsum.photos/id/96",
        price: 6999 // $69.99
      },
    });

    await prisma.products.create({
      data: {
        title: "Fresh Organic Raspberries",
        description: "Farm-fresh organic raspberries grown in Pacific Northwest. Hand-picked at peak ripeness and delivered fresh. Perfect for desserts, smoothies, or healthy snacking.",
        url: "https://picsum.photos/id/102",
        price: 899 // $8.99
      },
    });

    await prisma.products.create({
      data: {
        title: "Classic American Muscle Car",
        description: "Restored 1969 Chevrolet Camaro SS with original V8 engine. Complete restoration with modern safety features. A true piece of American automotive history.",
        url: "https://picsum.photos/id/111",
        price: 4599999 // $45,999.99
      },
    });

    await prisma.products.create({
      data: {
        title: "Mac Studio Desktop",
        description: "Apple Mac Studio with M2 Ultra chip for professional workflows. Compact design with incredible performance for video editing, 3D rendering, and software development.",
        url: "https://picsum.photos/id/119",
        price: 399999 // $3,999.99
      },
    });

    await prisma.products.create({
      data: {
        title: "Rustic Wooden Bench",
        description: "Handcrafted wooden bench made from reclaimed American hardwood. Perfect for entryways, gardens, or indoor seating. Features natural wood grain and protective finish.",
        url: "https://picsum.photos/id/129",
        price: 24999 // $249.99
      },
    });

    await prisma.products.create({
      data: {
        title: "Classic Car Collection",
        description: "Rare collection of vintage American automobiles in various stages of restoration. Perfect for collectors or restoration enthusiasts. Includes documentation and parts.",
        url: "https://picsum.photos/id/133",
        price: 15999999 // $159,999.99
      },
    });

    await prisma.products.create({
      data: {
        title: "Acoustic Guitar",
        description: "Professional acoustic guitar with solid spruce top and mahogany back. Excellent tone quality suitable for recording and live performance. Includes hard case and accessories.",
        url: "https://picsum.photos/id/145",
        price: 79999 // $799.99
      },
    });
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
