// app/routes/apps.wishlist.products.jsx
import db from "../db.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customer_id");
  const shop = url.searchParams.get("shop");

  console.log(
    "✅ GET Wishlist Products - Customer:",
    customerId,
    "Shop:",
    shop,
  );

  if (!customerId || !shop) {
    return Response.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const wishlistItems = await db.wishlist.findMany({
      where: { customerId, shop },
      orderBy: { createdAt: "desc" },
    });

    // Return products with all data
    const products = wishlistItems.map((item) => ({
      productId: item.productId,
      productHandle: item.productHandle,
      variantId: item.variantId,
      createdAt: item.createdAt,
    }));

    console.log("✅ Found wishlist products:", products.length);

    return Response.json(products);
  } catch (error) {
    console.error("❌ Error fetching wishlist products:", error);
    return Response.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 },
    );
  }
}
