import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";
import { hashPassword } from "../src/lib/auth";

const BRANCH_IMAGO = "branch-imago";
const BRANCH_KK = "branch-kk";
const BRANCH_SURIA = "branch-suria";

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required. Copy .env.example to .env.local");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  console.log("Seeding database...");

  const [business] = await db
    .insert(schema.businesses)
    .values({ name: "Mixue Sabah" })
    .returning();

  const branchData = [
    { id: BRANCH_IMAGO, name: "Imago Branch", address: "Imago Shopping Mall, KK" },
    { id: BRANCH_KK, name: "KK Times Square", address: "KK Times Square, Kota Kinabalu" },
    { id: BRANCH_SURIA, name: "Suria Sabah", address: "Suria Sabah, Kota Kinabalu" },
  ];

  for (const b of branchData) {
    await db.insert(schema.branches).values({
      id: b.id,
      businessId: business.id,
      name: b.name,
      address: b.address,
    });
  }

  const passwordHash = await hashPassword("demo123");
  await db.insert(schema.users).values({
    businessId: business.id,
    email: "demo@store.com",
    passwordHash,
    name: "Demo Owner",
    role: "owner",
  });

  const rawMaterials = [
    { name: "Mango", unit: "kg", currentQty: "8.5", minimumQty: "10" },
    { name: "Milk", unit: "L", currentQty: "6", minimumQty: "10" },
    { name: "Sugar", unit: "kg", currentQty: "15", minimumQty: "5" },
    { name: "Tea", unit: "kg", currentQty: "4", minimumQty: "3" },
    { name: "Pearls", unit: "kg", currentQty: "2", minimumQty: "5" },
    { name: "Ice", unit: "kg", currentQty: "20", minimumQty: "10" },
    { name: "Cup", unit: "pcs", currentQty: "120", minimumQty: "500" },
    { name: "Straw", unit: "pcs", currentQty: "80", minimumQty: "300" },
    { name: "Coffee Beans", unit: "kg", currentQty: "0", minimumQty: "2" },
  ];

  const inventoryMap: Record<string, Record<string, string>> = {};

  for (const branch of [BRANCH_IMAGO, BRANCH_KK, BRANCH_SURIA]) {
    inventoryMap[branch] = {};
    for (const item of rawMaterials) {
      const qty =
        branch === BRANCH_IMAGO
          ? item.currentQty
          : String(parseFloat(item.currentQty) * 1.5);
      const [inv] = await db
        .insert(schema.inventoryItems)
        .values({
          branchId: branch,
          name: item.name,
          type: "raw",
          unit: item.unit,
          currentQty: qty,
          minimumQty: item.minimumQty,
        })
        .returning();
      inventoryMap[branch][item.name] = inv.id;
    }
  }

  const productDefs = [
    {
      name: "Mango Smoothie",
      price: "8.90",
      category: "Smoothie",
      emoji: "🥤",
      ingredients: [
        { name: "Mango", qty: "0.1" },
        { name: "Milk", qty: "0.15" },
        { name: "Sugar", qty: "0.02" },
        { name: "Ice", qty: "0.05" },
        { name: "Cup", qty: "1" },
        { name: "Straw", qty: "1" },
      ],
    },
    {
      name: "Brown Sugar Pearl Milk Tea",
      price: "9.50",
      category: "Milk Tea",
      emoji: "🧋",
      ingredients: [
        { name: "Milk", qty: "0.2" },
        { name: "Tea", qty: "0.01" },
        { name: "Sugar", qty: "0.03" },
        { name: "Pearls", qty: "0.05" },
        { name: "Ice", qty: "0.03" },
        { name: "Cup", qty: "1" },
        { name: "Straw", qty: "1" },
      ],
    },
    {
      name: "Peach Tea",
      price: "7.50",
      category: "Tea",
      emoji: "🍑",
      ingredients: [
        { name: "Tea", qty: "0.01" },
        { name: "Sugar", qty: "0.02" },
        { name: "Ice", qty: "0.04" },
        { name: "Cup", qty: "1" },
        { name: "Straw", qty: "1" },
      ],
    },
    {
      name: "Americano",
      price: "6.50",
      category: "Coffee",
      emoji: "☕",
      ingredients: [
        { name: "Coffee Beans", qty: "0.015" },
        { name: "Cup", qty: "1" },
      ],
    },
  ];

  for (const branch of [BRANCH_IMAGO, BRANCH_KK, BRANCH_SURIA]) {
    for (const prod of productDefs) {
      const [product] = await db
        .insert(schema.products)
        .values({
          branchId: branch,
          name: prod.name,
          price: prod.price,
          category: prod.category,
          emoji: prod.emoji,
        })
        .returning();

      for (const ing of prod.ingredients) {
        await db.insert(schema.productIngredients).values({
          productId: product.id,
          inventoryItemId: inventoryMap[branch][ing.name],
          quantity: ing.qty,
        });
      }
    }
  }

  const [john] = await db
    .insert(schema.customers)
    .values({
      businessId: business.id,
      name: "John",
      phone: "60123456789",
    })
    .returning();

  await db.insert(schema.customers).values([
    { businessId: business.id, name: "Sarah", phone: "60129876543" },
    { businessId: business.id, name: "David", phone: "60135551234" },
  ]);

  await db.insert(schema.bookings).values({
    branchId: BRANCH_IMAGO,
    customerId: john.id,
    bookingNumber: "1028",
    pickupDate: "2026-08-22",
    pickupTime: "15:00",
    status: "confirmed",
    total: "85.00",
  });

  console.log("Seed completed!");
  console.log("Login: demo@store.com / demo123");
}

seed().catch(console.error);
