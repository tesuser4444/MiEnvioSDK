import type { MienvioClient } from "../client";
import type { ApiResponse } from "../types/client";
import type {
	BulkCancelRequest,
	BulkCancelResponse,
	CancelResponse,
	CreateShipmentRequest,
	CreateShipmentResponse,
	ShipmentDetailResponse,
	ShipmentDraftRequest,
	ShipmentDraftResponse,
	ShipmentUpdateRequest,
	TrackingResponse,
} from "../types/shipment";

/**
 * Resource for managing shipments: drafts, creation, cancellation, and tracking.
 *
 * @see https://api.mienvio.mx/reference/createshipmentasdraft
 */
export class ShipmentsResource {
	constructor(private readonly client: MienvioClient) {}

	/**
	 * Create a shipment as a draft (unpaid, no carrier selected yet).
	 * Can be reviewed and paid later from the Mienvío web dashboard.
	 *
	 * @param params - Shipment draft payload (with addresses, items/package, and optional rate_id).
	 */
	async createDraft(
		params: ShipmentDraftRequest,
	): Promise<ApiResponse<ShipmentDraftResponse["data"]>> {
		return this.client.request<ShipmentDraftResponse["data"]>(
			"POST",
			"/v2/shipments/draft",
			params,
		);
	}

	/**
	 * Update an existing draft shipment.
	 *
	 * @param params - Updated shipment data (includes shipment `id` for each shipment).
	 */
	async updateDraft(
		params: ShipmentUpdateRequest,
	): Promise<ApiResponse<ShipmentDraftResponse["data"]>> {
		return this.client.request<ShipmentDraftResponse["data"]>(
			"PUT",
			"/v2/shipments",
			params,
		);
	}

	/**
	 * Create and pay for a shipment in a single step.
	 * Requires a `rate_id` on the service object and a valid payment method.
	 *
	 * @param params - Shipments to create + payment method.
	 */
	async create(
		params: CreateShipmentRequest,
	): Promise<ApiResponse<CreateShipmentResponse["data"]>> {
		return this.client.request<CreateShipmentResponse["data"]>(
			"POST",
			"/v2/shipments",
			params,
		);
	}

	/**
	 * Get details for a specific shipment.
	 *
	 * @param shipmentId - The shipment ID.
	 */
	async get(
		shipmentId: number | string,
	): Promise<ApiResponse<ShipmentDetailResponse["data"]>> {
		return this.client.request<ShipmentDetailResponse["data"]>(
			"GET",
			`/v2/shipments/${shipmentId}`,
		);
	}

	/**
	 * Cancel a single shipment.
	 *
	 * @param shipmentId - The shipment ID.
	 * @param reason - Cancellation reason.
	 */
	async cancel(
		shipmentId: number | string,
		reason: string,
	): Promise<ApiResponse<CancelResponse["data"]>> {
		return this.client.request<CancelResponse["data"]>(
			"POST",
			`/v2/shipments/${shipmentId}/cancel`,
			{ reason },
		);
	}

	/**
	 * Cancel multiple shipments at once.
	 *
	 * @param params - List of shipment IDs + reason.
	 */
	async bulkCancel(
		params: BulkCancelRequest,
	): Promise<ApiResponse<BulkCancelResponse["data"]>> {
		return this.client.request<BulkCancelResponse["data"]>(
			"POST",
			"/v2/shipments/cancel",
			params,
		);
	}

	/**
	 * Get tracking events for a single shipment.
	 *
	 * @param shipmentId - The shipment ID.
	 */
	async getTracking(
		shipmentId: number,
	): Promise<ApiResponse<TrackingResponse["data"]>> {
		return this.client.request<TrackingResponse["data"]>(
			"GET",
			`/v2/shipments/${shipmentId}/tracking`,
		);
	}

	/**
	 * Get tracking events for multiple shipments at once.
	 *
	 * @param shipmentIds - Array of shipment IDs.
	 */
	async bulkTracking(
		shipmentIds: number[],
	): Promise<ApiResponse<TrackingResponse["data"]>> {
		return this.client.request<TrackingResponse["data"]>(
			"POST",
			"/v2/shipments/tracking",
			{ shipment_ids: shipmentIds },
		);
	}
}
