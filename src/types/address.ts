/**
 * Address types for the Mienvío API.
 *
 * Two variants exist: a simplified address used when querying rates,
 * and a full address required when creating shipments (draft or direct).
 */

import type { Country, PackageType } from "./common";

// ── Simple address (rates endpoint) ────────────────────────────────────────

export interface AddressSimple {
	/** Contact name (max 35 chars) */
	name?: string;
	/** Street address (max 35 chars) */
	street?: string;
	/** Secondary address (max 35 chars) */
	street2?: string;
	/** Reference / notes (max 35 chars) */
	reference?: string;
	/** City or municipality (max 30 chars) */
	city_municipality?: string;
	/** Zip code (5-digit for MX) */
	zipcode: string;
	/** ISO 3166-1 alpha-2 country code */
	country: Country;
}

// ── Full address (shipment endpoints) ──────────────────────────────────────

export interface AddressFull extends AddressSimple {
	/** Phone number (max 10 chars) */
	phone?: string;
	/** Email address (max 50 chars) */
	email?: string;
	/** Mexican tax ID (RFC). Defaults to XAXX010101000 if omitted. */
	tax_id_number?: string;
}

// ── Input items / packages ─────────────────────────────────────────────────

export interface ItemInput {
	/** Weight in kg (≥ 1) */
	weight: number;
	/** Length in cm (≥ 1) */
	length: number;
	/** Width in cm (≥ 1) */
	width: number;
	/** Height in cm (≥ 1) */
	height: number;
	/** Declared value in MXN (≥ 15) */
	declared_value?: number;
	/** Quantity (≥ 1) */
	qty?: number;
	/** Item description (required for draft) */
	description?: string;
	/** Fiscal / SAT code (required for draft, e.g. "55101530") */
	fiscal_code?: string;
	/** Package type (required for draft, e.g. "box") */
	package_type?: PackageType;
	/** Optional external order ID from your system */
	external_order_id?: string;
}

export interface PackageInput {
	/** Weight in kg (≥ 1) */
	weight: number;
	/** Length in cm (≥ 1) */
	length: number;
	/** Width in cm (≥ 1) */
	width: number;
	/** Height in cm (≥ 1) */
	height: number;
	/** Declared value in MXN (≥ 15) */
	declared_value?: number;
	/** Package description (required for draft) */
	description?: string;
	/** Fiscal / SAT code (required for draft) */
	fiscal_code?: string;
	/** Package type (required for draft, e.g. "box") */
	package_type?: PackageType;
	/** Optional external order ID from your system */
	external_order_id?: string;
}

// ── Service selection ──────────────────────────────────────────────────────

export interface ServiceInput {
	/** Rate ID returned from GET/POST rates endpoint */
	rate_id?: string;
	/** Whether to insure the shipment */
	insurance?: boolean;
}
