import { describe, expect, test } from "bun:test";
import { MienvioError } from "../src/error";

describe("MienvioError", () => {
	test("creates error with status and message", () => {
		const err = new MienvioError(401, "Unauthorized");
		expect(err.status).toBe(401);
		expect(err.message).toBe("Unauthorized");
		expect(err.name).toBe("MienvioError");
	});

	test("isMienvioError brand is true", () => {
		const err = new MienvioError(404, "Not found");
		expect(err.isMienvioError).toBe(true);
	});

	test("stores error data when provided", () => {
		const data = {
			status: 422,
			message: "Validation failed",
			errors: { zipcode: ["is required"] },
		};
		const err = new MienvioError(422, "Validation failed", data);
		expect(err.data).toEqual(data);
		expect(err.data?.errors?.zipcode).toEqual(["is required"]);
	});

	test("handles network-like errors (status 0)", () => {
		const err = new MienvioError(0, "Network error: fetch failed");
		expect(err.status).toBe(0);
	});

	test("is instance of Error", () => {
		const err = new MienvioError(500, "Server error");
		expect(err).toBeInstanceOf(Error);
	});
});
