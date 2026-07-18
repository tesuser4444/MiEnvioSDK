import { describe, expect, mock, test } from "bun:test";
import { MienvioClient } from "../../src/client";
import type { ShipmentRatesRequest } from "../src/types/shipment";

function createMockResponse(data: unknown, status = 200, message = "OK") {
	return new Response(JSON.stringify({ status, message, data }), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

describe("RatesResource", () => {
	test("getRates sends POST to /v2/shipments/rates", async () => {
		globalThis.fetch = mock(async (url: RequestInfo | URL) => {
			expect(url.toString()).toMatch(/\/v2\/shipments\/rates$/);
			return createMockResponse([]);
		});

		const client = new MienvioClient({
			token: "test",
			sandbox: true,
			timeout: 5000,
		});
		const params: ShipmentRatesRequest = {
			packing_mode: "none",
			from_address: { zipcode: "06600", country: "MX" },
			to_address: { zipcode: "11520", country: "MX" },
			package: { weight: 5, length: 40, width: 40, height: 20 },
		};

		const result = await client.rates.getRates(params);
		expect(result.status).toBe(200);
	});
});
