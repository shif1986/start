import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "../src/lib/supabase/database.types";

const url = process.env.SUPABASE_TEST_URL ?? "";
const publishableKey = process.env.SUPABASE_TEST_PUBLISHABLE_KEY ?? "";
const secretKey = process.env.SUPABASE_TEST_SECRET_KEY ?? "";
const configured = Boolean(url && publishableKey && secretKey);
const suite = configured ? describe : describe.skip;

suite("Supabase local : Auth, API et Storage", () => {
  let admin: SupabaseClient<Database>;
  let customer: SupabaseClient<Database>;
  let professional: SupabaseClient<Database>;
  let customerUser: User;
  let professionalUser: User;
  let listingId = "";
  let storagePath = "";
  const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const customerEmail = `integration-customer-${suffix}@example.test`;
  const professionalEmail = `integration-pro-${suffix}@example.test`;
  const password = `Test-${crypto.randomUUID()}!aA1`;
  const slug = `integration-service-${suffix}`;

  beforeAll(async () => {
    if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(url)) {
      throw new Error("Les tests d’intégration refusent toute instance Supabase non locale.");
    }
    const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
    admin = createClient<Database>(url, secretKey, options);
    customer = createClient<Database>(url, publishableKey, options);
    professional = createClient<Database>(url, publishableKey, options);
  });

  afterAll(async () => {
    if (storagePath) await admin.storage.from("listing-images").remove([storagePath]);
    if (listingId) await admin.from("listings").delete().eq("id", listingId);
    if (professionalUser) {
      await admin.from("subscriptions").delete().eq("user_id", professionalUser.id);
      await admin.auth.admin.deleteUser(professionalUser.id);
    }
    if (customerUser) await admin.auth.admin.deleteUser(customerUser.id);
  });

  it("inscrit, confirme, connecte et déconnecte un particulier", async () => {
    const signUp = await customer.auth.signUp({ email: customerEmail, password, options: { data: { display_name: "Client intégration", account_type: "customer" } } });
    expect(signUp.error).toBeNull();
    expect(signUp.data.user).not.toBeNull();
    customerUser = signUp.data.user!;
    const confirmation = await admin.auth.admin.updateUserById(customerUser.id, { email_confirm: true });
    expect(confirmation.error).toBeNull();
    const signIn = await customer.auth.signInWithPassword({ email: customerEmail, password });
    expect(signIn.error).toBeNull();
    expect(signIn.data.session?.user.id).toBe(customerUser.id);
    expect((await customer.auth.signOut()).error).toBeNull();
    expect((await customer.auth.getSession()).data.session).toBeNull();
  });

  it("prépare le flux Google OAuth avec le callback autorisé", async () => {
    const oauth = await customer.auth.signInWithOAuth({ provider: "google", options: { redirectTo: "http://127.0.0.1:5173/auth/callback", skipBrowserRedirect: true } });
    expect(oauth.error).toBeNull();
    expect(oauth.data.url).toContain("/auth/v1/authorize");
    expect(oauth.data.url).toContain("provider=google");
  });

  it("crée les données professionnelles nécessaires avec un abonnement réel en base", async () => {
    const created = await admin.auth.admin.createUser({ email: professionalEmail, password, email_confirm: true, user_metadata: { display_name: "Pro intégration", account_type: "professional" } });
    expect(created.error).toBeNull();
    professionalUser = created.data.user!;
    expect((await professional.auth.signInWithPassword({ email: professionalEmail, password })).error).toBeNull();
    const plan = await admin.from("subscription_plans").select("id").eq("code", "pro_monthly").single();
    expect(plan.error).toBeNull();
    const subscription = await admin.from("subscriptions").insert({ user_id: professionalUser.id, plan_id: plan.data!.id, status: "active", provider: "stripe", provider_subscription_id: `sub_integration_${suffix}`, current_period_start: new Date().toISOString(), current_period_end: new Date(Date.now() + 86_400_000).toISOString() });
    expect(subscription.error).toBeNull();
  });

  it("crée une annonce propriétaire et charge catalogue et détail par RPC", async () => {
    const inserted = await professional.from("listings").insert({ owner_id: professionalUser.id, category_id: "10000000-0000-4000-8000-000000000005", title: "Service test intégration", slug, description: "Description complète créée par le test d’intégration Supabase.", city: "Lyon", status: "draft" }).select("id").single();
    expect(inserted.error).toBeNull();
    listingId = inserted.data!.id;
    const published = await professional.from("listings").update({ status: "published" }).eq("id", listingId);
    expect(published.error).toBeNull();

    const anonymous = createClient<Database>(url, publishableKey, { auth: { persistSession: false } });
    const catalogue = await anonymous.rpc("search_listings_v2", { search_query: "Service test intégration", page_size: 10, page_offset: 0 });
    expect(catalogue.error).toBeNull();
    expect((catalogue.data ?? []).some((item) => item.id === listingId)).toBe(true);
    const detail = await anonymous.rpc("get_listing_detail", { listing_slug: slug });
    expect(detail.error).toBeNull();
    expect((detail.data ?? [])[0]?.seller_username).toBeTruthy();
  });

  it("gère le favori avec un membre connecté", async () => {
    expect((await customer.auth.signInWithPassword({ email: customerEmail, password })).error).toBeNull();
    expect((await customer.from("favorites").insert({ user_id: customerUser.id, listing_id: listingId })).error).toBeNull();
    const favorites = await customer.from("favorites").select("listing_id").eq("user_id", customerUser.id);
    expect(favorites.data?.map((item) => item.listing_id)).toContain(listingId);
    expect((await customer.from("favorites").delete().eq("user_id", customerUser.id).eq("listing_id", listingId)).error).toBeNull();
  });

  it("isole les annonces du propriétaire", async () => {
    const result = await professional.from("listings").select("id,status").eq("owner_id", professionalUser.id);
    expect(result.error).toBeNull();
    expect(result.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: listingId, status: "published" })]));
  });

  it("charge une image dans Storage puis autorise une URL signée publique", async () => {
    storagePath = `${professionalUser.id}/${listingId}/0-integration.png`;
    const pixel = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"));
    const upload = await professional.storage.from("listing-images").upload(storagePath, pixel, { contentType: "image/png", upsert: false });
    expect(upload.error).toBeNull();
    const imageRow = await professional.from("listing_images").insert({ listing_id: listingId, storage_path: storagePath, position: 0, alt_text: "Pixel intégration" });
    expect(imageRow.error).toBeNull();
    const anonymous = createClient<Database>(url, publishableKey, { auth: { persistSession: false } });
    const signed = await anonymous.storage.from("listing-images").createSignedUrl(storagePath, 60);
    expect(signed.error).toBeNull();
    expect(signed.data?.signedUrl).toContain("/storage/v1/object/sign/listing-images/");
  });
});
