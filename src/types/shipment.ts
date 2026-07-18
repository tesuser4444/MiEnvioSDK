/**
 * Shipment-related request and response types for the Mienvío API v2.
 */

import type {
	AddressFull,
	AddressSimple,
	ItemInput,
	PackageInput,
	ServiceInput,
} from "./address";
import type {
	PackingMode,
	PaymentMethod,
	PurchaseStatus,
	ShipmentType,
	TrackingStatusCode,
} from "./common";

// ── Rates ──────────────────────────────────────────────────────────────────

export interface ShipmentRatesRequest {
	/** Packing mode */
	packing_mode: PackingMode;
	/** Origin address */
	from_address: AddressSimple;
	/** Destination address */
	to_address: AddressSimple;
	/** Items (required when packing_mode = "existing") */
	items?: ItemInput[];
	/** Custom package (required when packing_mode = "none") */
	package?: PackageInput;
}

export interface RateDetail {
	base_cost: number;
	[key: string]: unknown;
}

export interface RatePricing {
	total: number;
	detail: RateDetail;
	[key: string]: unknown;
}

export interface Rate {
	rate_id: number;
	currency: string;
	/** @deprecated Use `pricing` instead */
	amount?: {
		total: number;
		detail: RateDetail;
	};
	service_name: string;
	provider: string;
	duration_terms: string;
	days: number;
	min_weight: number;
	max_weight: number;
	provider_img: string;
	is_ocurre: boolean;
	pricing?: RatePricing;
}

export interface PackageRate {
	weight: number;
	length: number;
	width: number;
	height: number;
	declared_value: number;
	volumetric_weight: number;
	total_rates: number;
	rates: Rate[];
}

export interface RatesResponse {
	data: PackageRate[];
	status: number;
	message: string;
}

// ── Draft / Shipment Creation ──────────────────────────────────────────────

export interface ShipmentDraftRequest {
	shipments: ShipmentDraftInput[];
}

export interface ShipmentDraftInput {
	packing_mode: PackingMode;
	from_address: AddressFull;
	to_address: AddressFull;
	items?: ItemInput[];
	package?: PackageInput;
	service: ServiceInput;
}

export interface ShipmentResponse {
	shipment_id: number;
	packing_mode: PackingMode;
	from_address: AddressFull & { state: string };
	to_address: AddressFull & { state: string };
	package: {
		weight: number;
		length: number;
		width: number;
		height: number;
		volumetric_weight: number;
		real_weight: number;
		real_length: number;
		real_width: number;
		real_height: number;
		description: string;
		fiscal_code: string;
		package_type: string;
		[key: string]: unknown;
	};
	rate?: Rate;
	label: string | null;
	pricing?: RatePricing;
	tracking_number: string;
	order_id: string | null;
	external_order_id: string | null;
	shipment_type: ShipmentType;
	packing_date: string | null;
	created_at: string;
	updated_at: string;
	[key: string]: unknown;
}

export interface ShipmentDraftResponse {
	data: ShipmentResponse | ShipmentResponse[];
	status: number;
	message: string;
}

// ── Create (pay) Shipment ──────────────────────────────────────────────────

export interface CreateShipmentRequest {
	payment_method: PaymentMethod;
	shipment_ids?: number[];
	shipments?: ShipmentDraftInput[];
}

export interface CreateShipmentResponse {
	data: ShipmentResponse | ShipmentResponse[];
	status: number;
	message: string;
	purchase_id?: number;
}

// ── Update Shipment ────────────────────────────────────────────────────────

export interface ShipmentUpdateInput extends ShipmentDraftInput {
	id: number;
}

export interface ShipmentUpdateRequest {
	shipments: ShipmentUpdateInput[];
}

// ── Cancel ─────────────────────────────────────────────────────────────────

export interface CancelShipmentRequest {
	reason: string;
}

export interface BulkCancelRequest {
	shipments: Array<{
		shipment_id: string;
	}>;
	reason: string;
}

export interface CancelResponse {
	status: number;
	message: string;
	data?: {
		cancelled: boolean;
		[key: string]: unknown;
	};
}

export interface BulkCancelResponse {
	status: number;
	message: string;
	data: Array<{
		shipment_id: string;
		success: boolean;
		error?: string;
	}>;
}

// ── Tracking ────────────────────────────────────────────────────────────────

export interface TrackingEvent {
	id: number;
	status: TrackingStatusCode;
	description: string;
	location: string;
	timestamp: string;
	created_at: string;
	[key: string]: unknown;
}

export interface TrackingResponse {
	data: Array<{
		shipment_id: number;
		tracking_number: string;
		status: TrackingStatusCode;
		events: TrackingEvent[];
		[key: string]: unknown;
	}>;
	status: number;
	message: string;
}

export interface BulkTrackingResponse {
	data: Array<{
		shipment_id: number;
		tracking_number: string;
		status: TrackingStatusCode;
		events: TrackingEvent[];
		[key: string]: unknown;
	}>;
	status: number;
	message: string;
}

// ── Purchase ────────────────────────────────────────────────────────────────

export interface PurchaseDetailResponse {
	data: {
		id: number;
		status: PurchaseStatus;
		shipment_type: ShipmentType;
		total: number;
		shipments: ShipmentResponse[];
		created_at: string;
		[key: string]: unknown;
	};
	status: number;
	message: string;
}

// ── Shipment Detail ─────────────────────────────────────────────────────────

export interface ShipmentDetailResponse {
	data: ShipmentResponse;
	status: number;
	message: string;
}
