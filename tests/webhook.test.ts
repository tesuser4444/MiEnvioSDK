import { describe, expect, test } from "bun:test";
import type { WebhookPayload } from "../src/types/webhook";
import { isWebhookPayload, parseWebhookPayload } from "../src/types/webhook";

describe("parseWebhookPayload", () => {
	test("parses a valid webhook payload", () => {
		const raw = JSON.stringify({
			event: "tracking.status",
			data: {
				shipment_id: 123,
				tracking_number: "MIE123456",
				status: "delivered",
			},
			timestamp: "2025-01-15T10:30:00Z",
		});

		const result = parseWebhookPayload(raw);
		expect(result.event).toBe("tracking.status");
		expect(result.data.shipment_id).toBe(123);
		expect(result.data.status).toBe("delivered");
	});

	test("parses label.error webhook with details", () => {
		const raw = JSON.stringify({
			event: "label.error",
			data: {
				details: [
					{
						shipment_id: 456,
						tracking_number: "MIE789",
						error_code: "INVALID_ADDRESS",
						error_message: "Address validation failed",
					},
				],
			},
			timestamp: "2025-01-15T11:00:00Z",
		});

		const result = parseWebhookPayload(raw);
		expect(result.event).toBe("label.error");
		expect(result.data.details).toHaveLength(1);
		expect(result.data.details?.[0].error_code).toBe("INVALID_ADDRESS");
	});

	test("throws on missing event field", () => {
		const raw = JSON.stringify({
			data: { shipment_id: 1 },
			timestamp: "2025-01-15T10:30:00Z",
		});

		expect(() => parseWebhookPayload(raw)).toThrow("Invalid webhook payload");
	});

	test("throws on invalid JSON", () => {
		expect(() => parseWebhookPayload("not json")).toThrow();
	});

	test("throws on null body", () => {
		expect(() => parseWebhookPayload("null")).toThrow(
			"Invalid webhook payload",
		);
	});
});

describe("isWebhookPayload", () => {
	test("returns true for valid payload", () => {
		const payload: WebhookPayload = {
			event: "label.created",
			data: { shipment_id: 1 },
			timestamp: "2025-01-15T10:30:00Z",
		};
		expect(isWebhookPayload(payload)).toBe(true);
	});

	test("returns false for null", () => {
		expect(isWebhookPayload(null)).toBe(false);
	});

	test("returns false for primitive", () => {
		expect(isWebhookPayload("string")).toBe(false);
	});

	test("returns false when event is missing", () => {
		expect(isWebhookPayload({ data: {} })).toBe(false);
	});

	test("returns false when data is missing", () => {
		expect(isWebhookPayload({ event: "test" })).toBe(false);
	});
});
