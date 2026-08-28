import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./use-auth";

const unsubscribe = vi.fn();
const getSession = vi.fn().mockResolvedValue({ data: { session: { user: { id: "user-id", email: "user@example.test" } } }, error: null });
const onAuthStateChange = vi.fn().mockReturnValue({ data: { subscription: { unsubscribe } } });

vi.mock("../../../lib/supabase/client", () => ({
  getSupabaseClient: () => ({ auth: { getSession, onAuthStateChange } }),
}));
vi.mock("../../../lib/data-source", () => ({ getDataSource: () => "supabase" }));

function Probe() {
  const { session, isLoading } = useAuth();
  return <span>{isLoading ? "loading" : session?.user.email ?? "anonymous"}</span>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    unsubscribe.mockClear();
    getSession.mockClear();
    onAuthStateChange.mockClear();
  });

  it("restaure la session et installe un seul listener", async () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    await screen.findByText("user@example.test");
    expect(getSession).toHaveBeenCalledTimes(1);
    expect(onAuthStateChange).toHaveBeenCalledTimes(1);
  });

  it("nettoie le listener au démontage", async () => {
    const view = render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(getSession).toHaveBeenCalled());
    view.unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
