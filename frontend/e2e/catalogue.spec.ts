import { expect, test } from "@playwright/test";

const isStatic = process.env.VITE_DATA_SOURCE === "static";

test("une annonce publiée est recherchable et sa fiche publique charge", async ({ page }) => {
  test.setTimeout(120_000);
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await page.goto("/annonces", { waitUntil: "domcontentloaded" });
  const search = page.getByPlaceholder("Métier, service, annonce...");
  await expect(search).toBeVisible();
  const query = isStatic ? "Création de sites" : "Garagiste";
  const title = isStatic ? /Création de sites web pour associations/i : /Garagiste \+ vente de véhicule/i;
  await search.fill(query);
  await expect(page).toHaveURL(new RegExp(`(?:\\?|&)q=${encodeURIComponent(query).replace(/%20/g, "(?:%20|\\+)")}(?:&|$)`));

  const listingLink = page.getByRole("link", { name: new RegExp(`Voir l'annonce ${title.source}`, "i") });
  await expect(listingLink).toBeVisible({ timeout: 30_000 });
  await listingLink.click();

  await expect(page).toHaveURL(isStatic ? /\/annonce\/6$/ : /\/annonce\/garagiste-vente-de-vehicule-/);
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  if (isStatic) {
    await expect(page.getByText("Annonce de démonstration")).toBeVisible();
  } else {
    await expect(page.getByRole("link", { name: "Signaler cette annonce" })).toBeVisible();
  }
  const listingImage = page.getByRole("region", { name: "Galerie de l’annonce" }).getByRole("img");
  await expect(listingImage).toBeVisible();
  await expect.poll(() => listingImage.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(browserErrors).toEqual([]);
});

test("le catalogue respecte la source de données configurée", async ({ page }) => {
  if (isStatic) {
    await page.goto("/annonce/5", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Annonce de démonstration")).toBeVisible();
    return;
  }

  await page.goto("/annonce/5", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Annonce introuvable" })).toBeVisible();
  await expect(page.getByText("Annonce de démonstration")).toHaveCount(0);
});
