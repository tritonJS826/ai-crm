import {apiClient} from "src/services/apiClient";

type PaymentResponse = {
  confirmation_url: string;
};

export async function getPaymentLink(): Promise<string> {
  const response = await apiClient.post<PaymentResponse>("/payment/create");

  return response.confirmation_url;
}
