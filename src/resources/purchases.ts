import type { MienvioClient } from "../client";
import type { ApiResponse } from "../types/client";
import type { PurchaseDetailResponse } from "../types/shipment";

/**
 * Resource for querying purchase records.
 *
 * A purchase groups one or more shipments created together.
 */
export class PurchasesResource {
	constructor(private readonly client: MienvioClient) {}

	/**
	 * Get details for a specific purchase.
	 *
	 * @param purchaseId - The purchase ID.
	 */
	async get(
		purchaseId: number | string,
	): Promise<ApiResponse<PurchaseDetailResponse["data"]>> {
		return this.client.request<PurchaseDetailResponse["data"]>(
			"GET",
			`/v2/purchases/${purchaseId}`,
		);
	}
}
