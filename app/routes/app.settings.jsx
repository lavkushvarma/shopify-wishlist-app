import { useLoaderData, useSubmit, useNavigation } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useState, useCallback, useEffect } from "react";

/* =====================
   LOADER
===================== */
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  try {
    let settings = await db.wishlistSettings.findUnique({
      where: { shop: session.shop },
    });

    if (!settings) {
      settings = await db.wishlistSettings.create({
        data: {
          shop: session.shop,
          buttonText: "Add to Wishlist",
          buttonColor: "#000000",
          enableNotifications: false,
        },
      });
    }

    return Response.json({ settings, shop: session.shop });
  } catch (error) {
    console.error("Error loading settings:", error);
    return Response.json({
      settings: null,
      shop: session.shop,
      error: "Failed to load settings",
    });
  }
};

/* =====================
   ACTION
===================== */
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  try {
    await db.wishlistSettings.upsert({
      where: { shop: session.shop },
      update: {
        enableNotifications: formData.get("enableNotifications") === "true",
      },
      create: {
        shop: session.shop,
        enableNotifications: formData.get("enableNotifications") === "true",
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Save error:", error);
    return Response.json({ success: false }, { status: 500 });
  }
};

/* =====================
   PAGE
===================== */
export default function Settings() {
  const { settings, shop, error } = useLoaderData();
  const submit = useSubmit();
  const navigation = useNavigation();

  const isSaving = navigation.state === "submitting";
  const [showSuccess, setShowSuccess] = useState(false);

  const [enableNotifications, setEnableNotifications] = useState(
    settings?.enableNotifications || false,
  );

  /* ---------- Handlers ---------- */
  const handleSubmit = useCallback(() => {
    const formData = new FormData();
    formData.append("enableNotifications", enableNotifications.toString());

    submit(formData, { method: "post" });
    setShowSuccess(true);
  }, [enableNotifications, submit]);

  useEffect(() => {
    if (showSuccess) {
      const t = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showSuccess]);

  return (
    <s-page
      heading="Wishlist settings"
      backLink="/app"
      primaryAction={{
        content: "Save",
        loading: isSaving,
        onAction: handleSubmit,
      }}
      fullWidth
    >
      {/* ================= STATUS ================= */}
      {showSuccess && !isSaving && (
        <s-section>
          <s-banner tone="success">Settings saved successfully</s-banner>
        </s-section>
      )}

      {error && (
        <s-section>
          <s-banner tone="critical">{error}</s-banner>
        </s-section>
      )}

      {/* ================= FEATURES ================= */}
      <s-section>
        <s-box
          background="base"
          padding="large"
          borderRadius="large"
          border="small subdued solid"
        >
          <s-stack gap="base">
            <s-heading size="medium">Features</s-heading>

            <label style={{ display: "flex", gap: "8px" }}>
              <input
                type="checkbox"
                checked={enableNotifications}
                onChange={(e) => setEnableNotifications(e.target.checked)}
              />
              <s-text>
                Enable email notifications
                <br />
                <s-text tone="subdued">Coming soon</s-text>
              </s-text>
            </label>
          </s-stack>
        </s-box>
      </s-section>

      {/* ================= INSTALLATION ================= */}
      <s-section>
        <s-box
          background="base"
          padding="large"
          borderRadius="large"
          border="small subdued solid"
        >
          <s-stack gap="base">
            <s-heading size="medium">Installation</s-heading>

            <s-text>
              1. Open your theme editor
              <br />
              2. Add the “Wishlist Button” app block to product pages
              <br />
              3. Save and test on storefront
            </s-text>

            <s-stack direction="inline" gap="base">
              <s-button href={`https://${shop}/admin/themes`} target="_blank">
                Open theme editor
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
        </s-box>
      </s-section>

      {/* ================= APP INFO ================= */}
      <s-section>
        <s-box
          background="base"
          padding="large"
          borderRadius="large"
          border="small subdued solid"
        >
          <s-stack gap="base">
            <s-heading size="medium">App information</s-heading>

            <s-stack gap="small">
              <s-text>Shop: {shop}</s-text>
              <s-text>Version: 1.0.0</s-text>
              <s-text>App proxy: /apps/wishlist</s-text>
            </s-stack>
          </s-stack>
        </s-box>
      </s-section>

      {/* ================= DANGER ZONE ================= */}
      <s-section>
        <s-box
          background="critical"
          padding="large"
          borderRadius="large"
          border="small critical solid"
        >
          <s-stack gap="base">
            <s-heading size="medium" tone="critical">
              Danger zone
            </s-heading>

            <s-text>
              Permanently delete all wishlist data for this store.
            </s-text>

            <s-button
              tone="critical"
              onClick={() => {
                if (
                  confirm("Are you sure you want to clear all wishlist data?")
                ) {
                  alert("Clear wishlist data coming soon");
                }
              }}
            >
              Clear all wishlist data
            </s-button>
          </s-stack>
        </s-box>
      </s-section>
    </s-page>
  );
}
