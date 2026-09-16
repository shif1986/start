import { expect, test } from "@playwright/test";

test("les routes publiques exposent leurs métadonnées sans inventer de canonique", async ({ page }) => {
  await page.goto("/annonces");

  await expect(page).toHaveTitle(/Toutes les annonces/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Toutes les annonces/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});

test("une route inconnue affiche une vraie page 404 applicative non indexable", async ({ page }) => {
  await page.goto("/route-inexistante");

  await expect(page.getByRole("heading", { level: 1, name: "Page introuvable" })).toBeVisible();
  await expect(page).toHaveTitle(/Page introuvable/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});
