/**
 * Client configuration and API response wrapper types.
 */

// ── Configuration ──────────────────────────────────────────────────────────

export interface MienvioConfig {
	/** API token (Bearer token / JWT) */
	token: string;
	/** Custom base URL override. If omitted, use sandbox or production default. */
	baseUrl?: string;
	/** Set to true to use the sandbox environment (dev-sandbox.mienvio.mx). */
	sandbox?: boolean;
	/** Request timeout in milliseconds (default 30_000). */
	timeout?: number;
}

// ── API Response ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
	status: number;
	message: string;
	data: T;
}

// ── Error types ────────────────────────────────────────────────────────────

export interface MienvioErrorData {
	status: number;
	message: string;
	/** Field-level validation errors (common on 422 responses). */
	errors?: Record<string, string[]>;
	[key: string]: unknown;
}

/** Default sandbox base URL. */
export const SANDBOX_BASE_URL = "https://dev-sandbox.mienvio.mx/api";

/** Default production base URL. */
export const PRODUCTION_BASE_URL = "https://production.mienvio.mx/api";
