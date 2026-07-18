import { MienvioError } from "./error";
import { PurchasesResource } from "./resources/purchases";
import { RatesResource } from "./resources/rates";
import { ShipmentsResource } from "./resources/shipments";
import type {
	ApiResponse,
	MienvioConfig,
	MienvioErrorData,
} from "./types/client";
import { PRODUCTION_BASE_URL, SANDBOX_BASE_URL } from "./types/client";

/**
 * Main client for the Mienvío API v2.
 *
 * Composes resource classes for a clean, namespace-driven API:
 *
 * ```ts
 * const mienvio = new MienvioClient({ token: "xxx", sandbox: true });
 * const rates = await mienvio.rates.getRates({ ... });
 * ```
 */
export class MienvioClient {
	readonly config: Required<Pick<MienvioConfig, "timeout">> & MienvioConfig;
	readonly rates: RatesResource;
	readonly shipments: ShipmentsResource;
	readonly purchases: PurchasesResource;

	constructor(config: MienvioConfig) {
		this.config = {
			...config,
			timeout: config.timeout ?? 30_000,
		};
		this.rates = new RatesResource(this);
		this.shipments = new ShipmentsResource(this);
		this.purchases = new PurchasesResource(this);
	}

	/**
	 * Resolve the base URL from the config.
	 */
	get baseUrl(): string {
		return (
			this.config.baseUrl ??
			(this.config.sandbox ? SANDBOX_BASE_URL : PRODUCTION_BASE_URL)
		);
	}

	/**
	 * Update the API token at runtime.
	 */
	setToken(token: string): void {
		this.config.token = token;
	}

	// ── Internal request method ──────────────────────────────────────────────

	/**
	 * Perform an authenticated HTTP request to the Mienvío API.
	 *
	 * @internal
	 */
	async request<T>(
		method: string,
		path: string,
		body?: unknown,
	): Promise<ApiResponse<T>> {
		const url = new URL(path, this.baseUrl);
		const headers = new Headers({
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${this.config.token}`,
		});

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

		try {
			const response = await fetch(url.toString(), {
				method,
				headers,
				body: body !== undefined ? JSON.stringify(body) : undefined,
				signal: controller.signal,
			});

			const json = (await response.json().catch(() => ({}))) as Record<
				string,
				unknown
			>;

			if (!response.ok) {
				const errorData: MienvioErrorData = {
					status: response.status,
					message: (json.message as string) ?? response.statusText,
					errors: json.errors as Record<string, string[]> | undefined,
				};
				throw new MienvioError(response.status, errorData.message, errorData);
			}

			return json as unknown as ApiResponse<T>;
		} catch (error) {
			if (error instanceof MienvioError) throw error;

			if (error instanceof DOMException && error.name === "AbortError") {
				throw new MienvioError(
					408,
					`Request timed out after ${this.config.timeout}ms`,
				);
			}

			const fetchError = error as Error;
			throw new MienvioError(
				0,
				`Network error: ${fetchError.message ?? "Unknown fetch error"}`,
			);
		} finally {
			clearTimeout(timeoutId);
		}
	}
}
