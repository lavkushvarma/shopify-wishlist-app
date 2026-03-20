// app/routes/apps.wishlist.jsx
import db from "../db.server";

// GET wishlist items for a customer
export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customer_id");
  const shop = url.searchParams.get("shop");

  console.log("✅ GET Wishlist - Customer:", customerId, "Shop:", shop);

  if (!customerId || !shop) {
    return Response.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const wishlistItems = await db.wishlist.findMany({
      where: { customerId, shop },
      orderBy: { createdAt: "desc" },
    });

    console.log("✅ Found items:", wishlistItems.length);
    
    // Return items with both ID and handle
    return Response.json({ 
      items: wishlistItems,
      count: wishlistItems.length 
    });
  } catch (error) {
    console.error("❌ Error fetching wishlist:", error);
    return Response.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

// POST to add/remove items
export async function action({ request }) {
  const formData = await request.formData();
  const customerId = formData.get("customer_id");
  const shop = formData.get("shop");
  const productId = formData.get("product_id");
  const productHandle = formData.get("product_handle");
  const variantId = formData.get("variant_id");
  const actionType = formData.get("action");

  console.log("✅ POST Wishlist - Action:", actionType, "Customer:", customerId, "Product:", productId, "Handle:", productHandle);

  if (!customerId || !shop || !productId) {
    return Response.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    if (actionType === "add") {
      const item = await db.wishlist.upsert({
        where: {
          customerId_shop_productId: { 
            customerId, 
            shop, 
            productId 
          },
        },
        update: { 
          productHandle: productHandle || null,
          variantId: variantId || null,
        },
        create: { 
          customerId, 
          shop, 
          productId,
          productHandle: productHandle || null,
          variantId: variantId || null,
        },
      });
      console.log("✅ Added to wishlist:", item);
      return Response.json({ success: true, item });
      
    } else if (actionType === "remove") {
      await db.wishlist.delete({
        where: {
          customerId_shop_productId: { 
            customerId, 
            shop, 
            productId 
          },
        },
      });
      console.log("✅ Removed from wishlist");
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
    
  } catch (error) {
    console.error("❌ Error updating wishlist:", error);
    return Response.json({ 
      error: "Failed to update wishlist",
      details: error.message 
    }, { status: 500 });
  }
}