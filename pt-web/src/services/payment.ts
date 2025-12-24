import {apiClient} from "src/services/apiClient";

type CheckoutSessionResponse = {
  url: string;
};

/**
 * TODO: integrate with backend Stripe Checkout endpoint.
 * Expects backend to create a session and return redirect URL.
 */
export async function createCheckoutSession(params: { productId: string; conversationId?: string }): Promise<string> {
  const search = new URLSearchParams();
  search.set("product_id", params.productId);
  if (params.conversationId) {
    search.set("conv_id", params.conversationId);
  }

  const response = await apiClient.get<CheckoutSessionResponse>(`/checkout?${search.toString()}`);

  return response.url;
}
