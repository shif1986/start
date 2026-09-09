import { expect, test, type Page } from "@playwright/test";

const responsiveWidths = [320, 375, 390, 768, 1024, 1440];
const publicRoutes = [
  "/",
  "/annonces",
  "/annonce/conseil-strategique-pour-entrepreneurs",
  "/a-propos",
  "/don",
  "/contact",
  "/publier",
  "/categories",
  "/connexion",
  "/inscription",
  "/abonnement",
  "/espace/particulier",
];
const desktopBreakpoint = 1120;
const browserErrors = new WeakMap<Page, string[]>();

test.beforeEach(({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
});

test.afterEach(({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([]);
});

test("un visiteur ne peut pas ouvrir le tableau de bord de modération", async ({ page }) => {
  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/connexion\?redirect=%2Fadmin/);
});

test("le callback OAuth affiche proprement une erreur fournisseur", async ({ page }) => {
  await page.goto("/auth/callback?error_description=Connexion%20Google%20annulee", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Connexion non finalisée" })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Connexion Google annulee");
  await expect(page.getByRole("link", { name: "Revenir à la connexion" })).toBeVisible();
});

test("la navigation reste compacte et sans chevauchement à toutes les largeurs", async ({ page }) => {
  test.setTimeout(120_000);
  for (const width of responsiveWidths) {
    await page.setViewportSize({ width, height: width < 500 ? 720 : 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const mobileNavigation = page.locator(".mobile-navigation-bar");
    const desktopNavigation = page.locator(".desktop-navigation");

    if (width < desktopBreakpoint) {
      await expect(mobileNavigation).toBeVisible();
      await expect(desktopNavigation).toBeHidden();
      const logo = page.locator(".mobile-navigation-bar .navigation-logo-link");
      const trigger = page.getByRole("button", { name: "Ouvrir le menu" });
      const [logoBox, triggerBox] = await Promise.all([
        logo.boundingBox(),
        trigger.boundingBox(),
      ]);

      expect(logoBox).not.toBeNull();
      expect(triggerBox).not.toBeNull();
      expect((logoBox?.x ?? 0) + (logoBox?.width ?? 0)).toBeLessThanOrEqual(
        triggerBox?.x ?? 0,
      );
      expect(triggerBox?.width).toBeGreaterThanOrEqual(44);
      expect(triggerBox?.height).toBeGreaterThanOrEqual(44);
    } else {
      await expect(desktopNavigation).toBeVisible();
      await expect(mobileNavigation).toBeHidden();
    }
  }
});

test("le drawer gère focus, Escape, overlay et verrouillage du scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const trigger = page.locator('[aria-controls="mobile-navigation-drawer"]');
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Menu principal" });
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(dialog.getByRole("button", { name: "Fermer le menu" })).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.body.style.position)).toBe("fixed");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.body.style.position)).toBe("");

  await trigger.click();
  await page.getByTestId("navigation-overlay").click({ position: { x: 10, y: 400 } });
  await expect(dialog).toBeHidden();
});

test("la compression au scroll applique l’hystérésis sans modifier l’espace réservé", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const navigation = page.locator(".site-navigation");
  const initialHeight = await navigation.evaluate((element) => element.getBoundingClientRect().height);
  await expect(navigation).toHaveAttribute("data-navigation-state", "expanded");

  await page.evaluate(() => window.scrollTo(0, 90));
  await expect(navigation).toHaveAttribute("data-navigation-state", "compact");
  expect(await navigation.evaluate((element) => element.getBoundingClientRect().height)).toBe(initialHeight);

  await page.evaluate(() => window.scrollTo(0, 50));
  await expect(navigation).toHaveAttribute("data-navigation-state", "compact");

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(navigation).toHaveAttribute("data-navigation-state", "expanded");
});

test("une navigation ferme le drawer et le redimensionnement nettoie ses effets", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  const dialog = page.getByRole("dialog", { name: "Menu principal" });
  await dialog.getByRole("link", { name: "Contact" }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(dialog).toBeHidden();

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await page.setViewportSize({ width: 1200, height: 700 });

  await expect(dialog).toBeHidden();
  await expect(page.locator(".desktop-navigation")).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.body.style.position)).toBe("");
});

test("prefers-reduced-motion conserve les états sans animation longue", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const transitionDuration = await page.locator(".mobile-navigation-drawer").evaluate(
    (element) => getComputedStyle(element).transitionDuration,
  );
  expect(transitionDuration).toBe("0.001s");

  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await expect(page.getByRole("dialog", { name: "Menu principal" })).toBeVisible();
});

test("toutes les pages restent dans le viewport sur mobile et tablette", async ({ page }) => {
  test.setTimeout(120_000);
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: width < 500 ? 780 : 900 });

    for (const route of publicRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect.poll(
        () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        { message: `${route} déborde à ${width}px` },
      ).toBe(true);

      const interactiveElements = page.locator("main button:visible, main input:visible:not([type='radio']):not([type='checkbox']):not([type='hidden']), main select:visible, main textarea:visible");
      const count = await interactiveElements.count();
      for (let index = 0; index < count; index += 1) {
        const box = await interactiveElements.nth(index).boundingBox();
        if (!box) continue;
        const controlName = await interactiveElements.nth(index).evaluate((element) =>
          `${element.tagName.toLowerCase()}[type="${element.getAttribute("type") ?? ""}"][name="${element.getAttribute("name") ?? ""}"]`,
        );
        expect(box.width, `${route}: ${controlName} trop étroit à ${width}px`).toBeGreaterThanOrEqual(40);
        expect(box.height, `${route}: ${controlName} trop bas à ${width}px`).toBeGreaterThanOrEqual(40);
      }
    }
  }
});
