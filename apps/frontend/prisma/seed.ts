// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding products...');

  const products = [
    {
      title: 'Midnight Runner Sneaker',
      description:
        'Black mesh running shoes with reflective accents and cushioned sole.',
      url: '/products/midnight-runner-sneaker',
      priceCents: 9900,
      imageUrl: 'https://picsum.photos/seed/midnight-runner/800/800',
    },
    {
      title: 'Aurora Trail Jacket',
      description:
        'Water-resistant trail jacket with breathable panels and adjustable hood.',
      url: '/products/aurora-trail-jacket',
      priceCents: 14900,
      imageUrl: 'https://picsum.photos/seed/aurora-trail/800/800',
    },
    {
      title: 'Civic Slim Backpack',
      description:
        'Slim urban backpack with padded laptop sleeve and hidden passport pocket.',
      url: '/products/civic-slim-backpack',
      priceCents: 12900,
      imageUrl: 'https://picsum.photos/seed/civic-backpack/800/800',
    },
  ];

  for (const p of products) {
    // Check if product exists by URL
    const existing = await prisma.product.findFirst({
      where: { url: p.url },
    });

    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
