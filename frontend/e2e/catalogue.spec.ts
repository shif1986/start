import { expect, test } from "@playwright/test";

test("une annonce Supabase publiée est recherchable et sa fiche publique charge", async ({ page }) => {
  test.setTimeout(120_000);
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await page.goto("/annonces", { waitUntil: "domcontentloaded" });
  const search = page.getByPlaceholder("Métier, service, annonce...");
  await expect(search).toBeVisible();
  await search.fill("Garagiste");
  await expect(page).toHaveURL(/(?:\?|&)q=Garagiste(?:&|$)/);

  const listingLink = page.getByRole("link", { name: /Voir l'annonce Garagiste \+ vente de véhicule/i });
  await expect(listingLink).toBeVisible({ timeout: 30_000 });
  await listingLink.click();

  await expect(page).toHaveURL(/\/annonce\/garagiste-vente-de-vehicule-/);
  await expect(page.getByRole("heading", { level: 1, name: /Garagiste \+ vente de véhicule/i })).toBeVisible();
  const listingImage = page.getByRole("region", { name: "Galerie de l’annonce" }).getByRole("img");
  await expect(listingImage).toBeVisible();
  await expect.poll(() => listingImage.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(browserErrors).toEqual([]);
});
