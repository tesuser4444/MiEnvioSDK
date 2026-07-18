import type { MienvioErrorData } from "./types/client";

/**
 * Typed error class for Mienvío API failures.
 */
export class MienvioError extends Error {
	/** HTTP status code (0 for network / timeout errors). */
	readonly status: number;
	/** The raw error data returned by the API. */
	readonly data?: MienvioErrorData;
	/** Brand check for instanceof-like detection across module boundaries. */
	readonly isMienvioError = true as const;

	constructor(status: number, message: string, data?: MienvioErrorData) {
		super(message);
		this.name = "MienvioError";
		this.status = status;
		this.data = data;
	}
}
