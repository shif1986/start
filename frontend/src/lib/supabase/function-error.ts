type FunctionErrorPayload = {
  error?: unknown;
};

function responseFromError(error: unknown) {
  if (!error || typeof error !== "object" || !("context" in error)) return null;
  const context = error.context;
  return context instanceof Response ? context : null;
}

export async function getFunctionErrorMessage(error: unknown, fallback: string) {
  const response = responseFromError(error);
  if (!response) return fallback;

  try {
    const payload = await response.clone().json() as FunctionErrorPayload;
    return typeof payload.error === "string" && payload.error.trim() ? payload.error : fallback;
  } catch {
    return fallback;
  }
}
