import type { MienvioClient } from "../client";
import type { ApiResponse } from "../types/client";
import type { RatesResponse, ShipmentRatesRequest } from "../types/shipment";

/**
 * Resource for querying shipping rates.
 *
 * @see https://api.mienvio.mx/reference/getshipmentrates
 */
export class RatesResource {
	constructor(private readonly client: MienvioClient) {}

	/**
	 * Fetch available shipping rates for a given origin, destination, and package.
	 *
	 * @param params - Origin, destination, and package/items specification.
	 * @returns A list of package-rate combinations from available carriers.
	 */
	async getRates(
		params: ShipmentRatesRequest,
	): Promise<ApiResponse<RatesResponse["data"]>> {
		return this.client.request<RatesResponse["data"]>(
			"POST",
			"/v2/shipments/rates",
			params,
		);
	}
}
