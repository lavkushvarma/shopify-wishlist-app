import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/* =======================
   LOADER
======================= */
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  try {
    const wishlists = await db.wishlist.findMany({
      where: { shop: session.shop },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const total = await db.wishlist.count({
      where: { shop: session.shop },
    });

    const uniqueCustomers = await db.wishlist.groupBy({
      by: ["customerId"],
      where: { shop: session.shop },
    });

    const topProducts = await db.wishlist.groupBy({
      by: ["productId"],
      where: { shop: session.shop },
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 5,
    });

    return Response.json({
      wishlists,
      stats: {
        total,
        uniqueCustomers: uniqueCustomers.length,
        topProducts,
      },
    });
  } catch (error) {
    console.error("Wishlist dashboard error:", error);
    return Response.json({
      wishlists: [],
      stats: { total: 0, uniqueCustomers: 0, topProducts: [] },
    });
  }
};

/* =======================
   PAGE
======================= */
export default function Index() {
  const { wishlists, stats } = useLoaderData();

  const rows = wishlists.map((item) => ({
    customerId: item.customerId,
    productId: item.productId,
    variantId: item.variantId || "All variants",
    createdAt: new Date(item.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <s-page heading="Wishlist dashboard" fullWidth>
      {/* =======================
          STATS
      ======================= */}
      <s-section>
        <s-stack direction="inline" gap="large-200" alignItems="stretch">
          <StatCard label="Total wishlist items" value={stats.total} />
          <StatCard label="Unique customers" value={stats.uniqueCustomers} />
          <StatCard
            label="Avg items per customer"
            value={
              stats.uniqueCustomers > 0
                ? (stats.total / stats.uniqueCustomers).toFixed(1)
                : 0
            }
          />
        </s-stack>
      </s-section>

      {/* =======================
          TOP PRODUCTS
      ======================= */}
      {stats.topProducts.length > 0 && (
        <s-section>
          <s-stack gap="base">
            <s-heading>Most wishlisted products</s-heading>

            <s-stack gap="small">
              {stats.topProducts.map((product, index) => (
                <s-box
                  key={product.productId}
                  padding="base"
                  borderRadius="medium"
                  background="subdued"
                >
                  <s-stack direction="inline" justifyContent="space-between">
                    <s-stack direction="inline" gap="small" alignItems="center">
                      <s-badge tone="info">{index + 1}</s-badge>
                      <s-text fontFamily="monospace">
                        {product.productId}
                      </s-text>
                    </s-stack>

                    <s-badge tone="success">
                      {product._count.productId} wishlists
                    </s-badge>
                  </s-stack>
                </s-box>
              ))}
            </s-stack>
          </s-stack>
        </s-section>
      )}

      {/* =======================
          TABLE
      ======================= */}
      <s-section padding="none">
        {rows.length === 0 ? (
          <EmptyState />
        ) : (
          <s-table>
            <s-table-header-row>
              <s-table-header>Customer</s-table-header>
              <s-table-header>Product</s-table-header>
              <s-table-header>Variant</s-table-header>
              <s-table-header>Date added</s-table-header>
            </s-table-header-row>

            <s-table-body>
              {rows.map((row, index) => (
                <s-table-row
                  key={`${row.customerId}-${row.productId}-${index}`}
                >
                  <s-table-cell>
                    <s-text fontFamily="monospace">
                      {row.customerId.slice(0, 20)}…
                    </s-text>
                  </s-table-cell>

                  <s-table-cell>
                    <s-text fontFamily="monospace">{row.productId}</s-text>
                  </s-table-cell>

                  <s-table-cell>
                    <s-badge tone="neutral">{row.variantId}</s-badge>
                  </s-table-cell>

                  <s-table-cell>
                    <s-text tone="subdued">{row.createdAt}</s-text>
                  </s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        )}
      </s-section>

      {/* =======================
          GETTING STARTED
      ======================= */}
      <s-section>
        <s-stack gap="base">
          <s-heading>Getting started</s-heading>
          <s-paragraph>
            Add the Wishlist Button block to your product pages to start
            collecting wishlist data.
          </s-paragraph>

          <s-stack direction="inline" gap="base">
            <s-button href="/app/settings" variant="primary">
              Configure settings
            </s-button>
            <s-button
              href="https://help.shopify.com/en/manual/online-store/themes/theme-structure/extend/apps"
              target="_blank"
              variant="secondary"
            >
              Learn more
            </s-button>
          </s-stack>
        </s-stack>
      </s-section>
    </s-page>
  );
}

/* =======================
   COMPONENTS
======================= */
function StatCard({ label, value }) {
  return (
    <s-box
      background="base"
      padding="large"
      borderRadius="large"
      border="small subdued solid"
      minInlineSize="220px"
    >
      <s-stack gap="small">
        <s-text tone="subdued">{label}</s-text>
        <s-heading size="large">{value}</s-heading>
      </s-stack>
    </s-box>
  );
}

function EmptyState() {
  return (
    <s-grid justifyItems="center" paddingBlock="large-400" gap="base">
      <s-heading>No wishlist items yet</s-heading>
      <s-paragraph align="center">
        Customers haven’t added any products to their wishlists yet. Enable the
        wishlist button on product pages to get started.
      </s-paragraph>

      <s-button-group>
        <s-button href="/app/settings" variant="primary">
          Enable wishlist
        </s-button>
      </s-button-group>
    </s-grid>
  );
}
