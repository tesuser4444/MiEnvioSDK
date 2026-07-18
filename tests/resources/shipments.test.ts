import { describe, expect, mock, test } from "bun:test";
import { MienvioClient } from "../../src/client";

function createMockResponse(data: unknown, status = 200, message = "OK") {
	return new Response(JSON.stringify({ status, message, data }), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

describe("ShipmentsResource", () => {
	const baseDraftPayload = () => ({
		shipments: [
			{
				packing_mode: "none" as const,
				from_address: {
					name: "Juan Pérez",
					phone: "5512345678",
					email: "juan@example.com",
					zipcode: "06600",
					country: "MX",
					street: "Calle 1",
				},
				to_address: {
					name: "María García",
					phone: "5598765432",
					email: "maria@example.com",
					zipcode: "11520",
					country: "MX",
					street: "Calle 2",
				},
				package: {
					weight: 5,
					length: 40,
					width: 40,
					height: 20,
					description: "Caja de documentos",
					fiscal_code: "55101530",
					package_type: "box" as const,
				},
				service: {},
			},
		],
	});

	test("createDraft sends POST to /v2/shipments/draft", async () => {
		globalThis.fetch = mock(async (url: RequestInfo | URL) => {
			expect(url.toString()).toMatch(/\/v2\/shipments\/draft$/);
			return createMockResponse({ shipment_id: 123 });
		});

		const client = new MienvioClient({
			token: "test",
			sandbox: true,
			timeout: 5000,
		});
		const result = await client.shipments.createDraft(baseDraftPayload());
		expect(result.status).toBe(200);
		expect((result.data as { shipment_id: number }).shipment_id).toBe(123);
	});

	test("updateDraft sends PUT to /v2/shipments", async () => {
		globalThis.fetch = mock(
			async (url: RequestInfo | URL, init?: RequestInit) => {
				expect(url.toString()).toMatch(/\/v2\/shipments$/);
				expect(init?.method).toBe("PUT");
				return createMockResponse([{ shipment_id: 123 }]);
			},
		);

		const client = new MienvioClient({
			token: "test",
			sandbox: true,
			timeout: 5000,
		});
		const result = await client.shipments.updateDraft({
			shipments: [{ ...baseDraftPayload().shipments[0], id: 123 }],
		});
		expect(result.status).toBe(200);
	});

	test("create sends POST to /v2/shipments", async () => {
		globalThis.fetch = mock(async (url: RequestInfo | URL) => {
			expect(url.toString()).toMatch(/\/v2\/shipments$/);
			return createMockResponse({ shipment_id: 456, purchase_id: 789 });
		});

		const client = new MienvioClient({
			token: "test",
			sandbox: true,
			timeout: 5000,
		});
		const result = await client.shipments.create({
			payment_method: "wallet",
			shipment_ids: [123],
		});
		expect(result.status).toBe(200);
	});

	test("get sends GET to /v2/shipments/:id", async () => {
		globalThis.fetch = mock(async (url: RequestInfo | URL) => {
			expect(url.toString()).toMatch(/\/v2\/shipments\/42$/);
			return createMockResponse({ shipment_id: 42 });
		});

		const client = new MienvioClient({
			token: "test",
			sandbox: true,
			timeout: 5000,
		});
		const result = await client.shipments.get(42);
		expect(result.status).toBe(200);
	});

	test("cancel sends POST to /v2/shipments/:id/cancel", async () => {
		globalThis.fetch = mock(
			async (url: RequestInfo | URL, init?: RequestInit) => {
				expect(url.toString()).toMatch(/\/v2\/shipments\/42\/cancel$/);
				const body = JSON.parse(init?.body as string);
				expect(body.reason).toBe("Cambié de opinión");
				return createMockResponse({ cancelled: true });
			},
		);

		const client = new MienvioClient({
			token: "test",
			sandbox: true,
			timeout: 5000,
		});
		const result = await client.shipments.cancel(42, "Cambié de opinión");
		expect(result.status).toBe(200);
	});

	test("bulkCancel sends POST to /v2/shipments/cancel", async () => {
		globalThis.fetch = mock(async (url: RequestInfo | URL) => {
			expect(url.toString()).toMatch(/\/v2\/shipments\/cancel$/);
			return createMockResponse([{ shipment_id: "42", success: true }]);
		});

		const client = new MienvioClient({
			token: "test",
			sandbox: true,
			timeout: 5000,
		});
		const result = await client.shipments.bulkCancel({
			shipments: [{ shipment_id: "42" }],
			reason: "Error en dirección",
		});
		expect(result.status).toBe(200);
	});

	test("getTracking sends GET to /v2/shipments/:id/tracking", async () => {
		globalThis.fetch = mock(async (url: RequestInfo | URL) => {
			expect(url.toString()).toMatch(/\/v2\/shipments\/123\/tracking$/);
			return createMockResponse([{ shipment_id: 123, events: [] }]);
		});

		const client = new MienvioClient({
			token: "test",
			sandbox: true,
			timeout: 5000,
		});
		const result = await client.shipments.getTracking(123);
		expect(result.status).toBe(200);
	});

	test("bulkTracking sends POST to /v2/shipments/tracking", async () => {
		globalThis.fetch = mock(async (url: RequestInfo | URL) => {
			expect(url.toString()).toMatch(/\/v2\/shipments\/tracking$/);
			return createMockResponse([{ shipment_id: 1, events: [] }]);
		});

		const client = new MienvioClient({
			token: "test",
			sandbox: true,
			timeout: 5000,
		});
		const result = await client.shipments.bulkTracking([1, 2, 3]);
		expect(result.status).toBe(200);
	});
});
