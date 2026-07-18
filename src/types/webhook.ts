/**
 * Webhook payload types for the Mienvío API.
 *
 * Mienvío sends webhooks to your registered endpoint when shipment events occur.
 */

import type { TrackingStatusCode } from "./common";

/** A detail entry for label error webhooks. */
export interface WebhookLabelErrorDetail {
	shipment_id: number;
	tracking_number?: string;
	error_code?: string;
	error_message?: string;
}

/** All possible webhook event types. */
export type WebhookEventType =
	| "label.created"
	| "label.error"
	| "label.purchased"
	| "purchase.created"
	| "tracking.status"
	| "shipment.cancelled"
	| string; // Allow future event types

/** The full webhook payload body. */
export interface WebhookPayload {
	event: WebhookEventType;
	data: {
		shipment_id?: number;
		purchase_id?: number;
		tracking_number?: string;
		status?: TrackingStatusCode;
		/** Present when event is "label.error" */
		details?: WebhookLabelErrorDetail[];
		[key: string]: unknown;
	};
	timestamp: string;
	[key: string]: unknown;
}

/**
 * Parses a raw JSON webhook body into a typed WebhookPayload.
 * Throws if the payload is invalid.
 */
export function parseWebhookPayload(body: string): WebhookPayload {
	const parsed = JSON.parse(body) as unknown;
	if (!isWebhookPayload(parsed)) {
		throw new TypeError(
			"Invalid webhook payload: missing required fields (event, data)",
		);
	}
	return parsed;
}

/**
 * Type guard that checks whether an unknown value matches WebhookPayload.
 */
export function isWebhookPayload(obj: unknown): obj is WebhookPayload {
	if (typeof obj !== "object" || obj === null) return false;
	const candidate = obj as Record<string, unknown>;
	return (
		typeof candidate.event === "string" &&
		typeof candidate.data === "object" &&
		candidate.data !== null
	);
}
