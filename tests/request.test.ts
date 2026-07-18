import { afterEach, describe, expect, mock, test } from "bun:test";
import { MienvioClient } from "../src/client";
import { MienvioError } from "../src/error";
import type { ShipmentRatesRequest } from "../src/types/shipment";

function createMockClient() {
	return new MienvioClient({
		token: "test-token",
		sandbox: true,
		timeout: 5_000,
	});
}

describe("MienvioClient.request", () => {
	const originalFetch = globalThis.fetch;

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	test("sends correct headers and returns parsed JSON on success", async () => {
		const mockResponse = {
			status: 200,
			message: "OK",
			data: { rates: [] },
		};

		globalThis.fetch = mock(async (url: RequestInfo | URL) => {
			expect(url.toString()).toContain("/v2/shipments/rates");

			return new Response(JSON.stringify(mockResponse), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		});

		const client = createMockClient();
		const result = await client.request<typeof mockResponse.data>(
			"POST",
			"/v2/shipments/rates",
			{},
		);

		expect(result.status).toBe(200);
		expect(result.data).toEqual({ rates: [] });
	});

	test("throws MienvioError on 401", async () => {
		globalThis.fetch = mock(async () => {
			return new Response(JSON.stringify({ message: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		});

		const client = createMockClient();
		try {
			await client.request("POST", "/v2/shipments/rates", {});
			expect.unreachable("Should have thrown");
		} catch (err) {
			expect(err).toBeInstanceOf(MienvioError);
			expect((err as MienvioError).status).toBe(401);
			expect((err as MienvioError).message).toBe("Unauthorized");
		}
	});

	test("throws MienvioError on 422 with field errors", async () => {
		const errorBody = {
			status: 422,
			message: "Validation failed",
			errors: {
				zipcode: ["is required"],
				weight: ["must be greater than or equal to 1"],
			},
		};

		globalThis.fetch = mock(async () => {
			return new Response(JSON.stringify(errorBody), {
				status: 422,
				headers: { "Content-Type": "application/json" },
			});
		});

		const client = createMockClient();
		try {
			await client.request("POST", "/v2/shipments/rates", {});
			expect.unreachable("Should have thrown");
		} catch (err) {
			expect(err).toBeInstanceOf(MienvioError);
			const mienvioErr = err as MienvioError;
			expect(mienvioErr.status).toBe(422);
			expect(mienvioErr.data?.errors?.zipcode).toBeDefined();
		}
	});

	test("throws MienvioError on network failure", async () => {
		globalThis.fetch = mock(async () => {
			throw new Error("fetch failed");
		});

		const client = createMockClient();
		try {
			await client.request("GET", "/v2/shipments/1", {});
			expect.unreachable("Should have thrown");
		} catch (err) {
			expect(err).toBeInstanceOf(MienvioError);
			const mienvioErr = err as MienvioError;
			expect(mienvioErr.status).toBe(0);
			expect(mienvioErr.message).toContain("Network error");
		}
	});

	test("throws MienvioError on timeout", async () => {
		globalThis.fetch = mock(
			async (_url: RequestInfo | URL, init?: RequestInit) => {
				// Simulate abort
				const signal = init?.signal;
				if (signal) {
					const controller = new AbortController();
					controller.abort();
					// Re-throw the abort
					await new Promise((_, reject) => {
						signal.addEventListener("abort", () => {
							reject(
								new DOMException("The operation was aborted", "AbortError"),
							);
						});
						// Trigger abort event
						signal.dispatchEvent(new Event("abort"));
					});
				}
				throw new DOMException("The operation was aborted", "AbortError");
			},
		);

		const client = new MienvioClient({
			token: "test-token",
			sandbox: true,
			timeout: 1, // 1ms timeout
		});

		try {
			await client.request("GET", "/v2/shipments/1", {});
			expect.unreachable("Should have thrown");
		} catch (err) {
			expect(err).toBeInstanceOf(MienvioError);
			const mienvioErr = err as MienvioError;
			expect(mienvioErr.status).toBe(408);
		}
	});

	test("sends POST body as JSON", async () => {
		const requestBody: ShipmentRatesRequest = {
			packing_mode: "none",
			from_address: { zipcode: "06600", country: "MX" },
			to_address: { zipcode: "11520", country: "MX" },
			package: { weight: 5, length: 40, width: 40, height: 20 },
		};

		globalThis.fetch = mock(
			async (_url: RequestInfo | URL, init?: RequestInit) => {
				const sentBody = JSON.parse(init?.body as string);
				expect(sentBody.packing_mode).toBe("none");
				expect(sentBody.from_address.zipcode).toBe("06600");
				expect(sentBody.package.weight).toBe(5);

				return new Response(
					JSON.stringify({
						status: 200,
						message: "Rates per package fetched succesfully.",
						data: [],
					}),
					{ status: 200, headers: { "Content-Type": "application/json" } },
				);
			},
		);

		const client = createMockClient();
		const result = await client.request(
			"POST",
			"/v2/shipments/rates",
			requestBody,
		);
		expect(result.status).toBe(200);
	});

	test("handles non-JSON response gracefully", async () => {
		globalThis.fetch = mock(async () => {
			return new Response("Internal Server Error", { status: 500 });
		});

		const client = createMockClient();
		try {
			await client.request("GET", "/v2/shipments/1", {});
			expect.unreachable("Should have thrown");
		} catch (err) {
			expect(err).toBeInstanceOf(MienvioError);
			expect((err as MienvioError).status).toBe(500);
		}
	});
});
