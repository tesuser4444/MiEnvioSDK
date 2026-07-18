/**
 * Shared enums and base types used across the Mienvío API.
 */

/** Determines how packages are packed: existing items or a single custom package. */
export type PackingMode = "existing" | "none";

/** ISO 3166-1 alpha-2 country code (e.g. "MX", "US"). */
export type Country = string;

/** Possible tracking statuses for a shipment. */
export type TrackingStatusCode =
	| "label_created"
	| "picked_up"
	| "on_transit"
	| "checkpoint"
	| "out_for_delivery"
	| "delivered"
	| "returned"
	| "return_done"
	| string; // Allow future values

/** Shipment type indicator. */
export type ShipmentType = "LABEL_CREATED" | "PURCHASE" | string;

/** Purchase status values. */
export type PurchaseStatus = "PAYED" | "PENDING" | "CANCELLED" | string;

/** Payment method for creating shipments. */
export type PaymentMethod = "wallet" | string;

/** Package types accepted by the API. */
export type PackageType = "box" | "envelope" | "package" | string;
