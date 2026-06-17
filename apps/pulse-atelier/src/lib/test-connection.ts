import { db } from "./db";

async function test() {
  try {
    const categories = await db.category.findMany();
    console.log("Connection successful! Categories fetched:", categories.length);
    console.log("Categories list:", categories.map(c => c.name));
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    process.exit(0);
  }
}

test();
