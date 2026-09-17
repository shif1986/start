import path from "node:path";
import { expect, test } from "@playwright/test";

const axeSourcePath = path.resolve("node_modules/axe-core/axe.min.js");
const publicRoutes = ["/", "/annonces", "/a-propos", "/don", "/contact", "/categories", "/abonnement"];
const themes = ["dark", "light"] as const;

test("les pages publiques principales respectent WCAG en modes sombre et clair", async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto("/", { waitUntil: "domcontentloaded" });

  for (const theme of themes) {
    await page.evaluate((value) => window.localStorage.setItem("start-theme", value), theme);

    for (const route of publicRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(500);
      await page.addScriptTag({ path: axeSourcePath });

      const violations = await page.evaluate(async () => {
        const axe = (window as typeof window & {
          axe: {
            run: (root: Document, options: object) => Promise<{
              violations: Array<{
                id: string;
                impact: string | null;
                nodes: Array<{ target: string[]; html: string; failureSummary?: string }>;
              }>;
            }>;
          };
        }).axe;
        const report = await axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        });

        return report.violations.map(({ id, impact, nodes }) => ({
          id,
          impact,
          nodes: nodes.map(({ target, html, failureSummary }) => ({ target, html, failureSummary })),
        }));
      });

      expect(violations, `${route} (${theme})`).toEqual([]);
    }
  }
});
