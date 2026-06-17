import { PrismaClient } from "@prisma/client";
import { categories } from "../src/data/categories";
import { brands } from "../src/data/brands";
import { products } from "../src/data/products";
import { customers } from "../src/data/customers";
import { orders } from "../src/data/orders";
import { articles, heroBanners } from "../src/data/content";
import { coupons, inventoryMovements, reviews, supportTickets } from "../src/data/admin";
import { accounts } from "../src/data/accounts";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing database...");
  await prisma.inventoryMovement.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.account.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.article.deleteMany();
  await prisma.heroBanner.deleteMany();
  await prisma.coupon.deleteMany();

  console.log("Seeding categories...");
  for (const c of categories) {
    await prisma.category.create({
      data: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
      },
    });
  }

  console.log("Seeding brands...");
  for (const b of brands) {
    await prisma.brand.create({
      data: {
        id: b.id,
        name: b.name,
        slug: b.slug,
        country: b.country,
        summary: b.summary,
      },
    });
  }

  console.log("Seeding products...");
  for (const p of products) {
    await prisma.product.create({
      data: {
        id: p.id,
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        brandId: p.brandId,
        categoryId: p.categoryId,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        rating: p.rating,
        reviewCount: p.reviewCount,
        soldCount: p.soldCount,
        isFeatured: p.isFeatured,
        status: p.status,
        badges: p.badges,
        image: p.image,
        gallery: p.gallery,
        shortDescription: p.shortDescription,
        description: p.description,
        ecosystems: p.ecosystems,
        useCases: p.useCases,
        compatibilityNotes: p.compatibilityNotes,
        batteryHours: p.batteryHours,
        connectivity: p.connectivity,
        waterResistance: p.waterResistance,
        sensors: p.sensors,
        anc: p.anc,
        weightGrams: p.weightGrams,
        warrantyMonths: p.warrantyMonths,
        bundleProductIds: p.bundleProductIds,
      },
    });
  }

  console.log("Seeding customers...");
  for (const c of customers) {
    await prisma.customer.create({
      data: {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        segment: c.segment,
        address: c.address,
        lifetimeSpend: c.lifetimeSpend,
        wishlistProductIds: c.wishlistProductIds,
      },
    });
  }

  console.log("Seeding accounts...");
  for (const acct of accounts) {
    await prisma.account.create({
      data: {
        id: acct.id,
        email: acct.email,
        password: acct.password,
        role: acct.role,
        name: acct.name,
        customerId: acct.customerId,
        phone: acct.phone || "",
        address: acct.address || "",
        createdAt: acct.createdAt ? new Date(acct.createdAt) : new Date(),
      },
    });
  }

  console.log("Seeding coupons...");
  for (const c of coupons) {
    await prisma.coupon.create({
      data: {
        id: c.id,
        code: c.code,
        type: c.type,
        value: c.value,
        usageCount: c.usageCount,
        usageLimit: c.usageLimit,
        active: c.active,
        startsAt: new Date(c.startsAt),
        endsAt: new Date(c.endsAt),
      },
    });
  }

  console.log("Seeding orders & order items...");
  for (const o of orders) {
    await prisma.order.create({
      data: {
        id: o.id,
        orderNumber: o.orderNumber,
        customerId: o.customerId,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        shippingAddress: o.shippingAddress,
        note: o.note,
        createdAt: new Date(o.createdAt),
        subtotal: o.subtotal,
        discount: o.discount,
        shippingFee: o.shippingFee,
        total: o.total,
        items: {
          create: o.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    });
  }

  console.log("Seeding reviews...");
  for (const r of reviews) {
    await prisma.review.create({
      data: {
        id: r.id,
        productId: r.productId,
        customerId: r.customerId,
        rating: r.rating,
        content: r.content,
        status: r.status,
        createdAt: new Date(r.createdAt),
      },
    });
  }

  console.log("Seeding articles & hero banners...");
  for (const a of articles) {
    await prisma.article.create({
      data: {
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        category: a.category,
        published: a.published,
      },
    });
  }

  for (const h of heroBanners) {
    await prisma.heroBanner.create({
      data: {
        id: h.id,
        title: h.title,
        subtitle: h.subtitle,
        ctaLabel: h.ctaLabel,
        ctaHref: h.ctaHref,
        productId: h.productId,
      },
    });
  }

  console.log("Seeding support tickets...");
  for (const s of supportTickets) {
    await prisma.supportTicket.create({
      data: {
        id: s.id,
        customerId: s.customerId,
        productId: s.productId,
        subject: s.subject,
        status: s.status,
        priority: s.priority,
        assignedTo: s.assignedTo,
        createdAt: new Date(s.createdAt),
      },
    });
  }

  console.log("Seeding inventory movements...");
  for (const im of inventoryMovements) {
    await prisma.inventoryMovement.create({
      data: {
        id: im.id,
        productId: im.productId,
        type: im.type,
        quantity: im.quantity,
        reason: im.reason,
        createdAt: new Date(im.createdAt),
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
