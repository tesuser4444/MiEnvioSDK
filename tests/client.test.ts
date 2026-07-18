import { describe, expect, test } from "bun:test";
import { MienvioClient } from "../src/client";
import { PRODUCTION_BASE_URL, SANDBOX_BASE_URL } from "../src/types/client";

describe("MienvioClient", () => {
	const testToken = "test-token-123";

	test("uses sandbox URL when sandbox = true", () => {
		const client = new MienvioClient({ token: testToken, sandbox: true });
		expect(client.baseUrl).toBe(SANDBOX_BASE_URL);
	});

	test("uses production URL when sandbox = false", () => {
		const client = new MienvioClient({ token: testToken, sandbox: false });
		expect(client.baseUrl).toBe(PRODUCTION_BASE_URL);
	});

	test("uses production URL when sandbox is not set", () => {
		const client = new MienvioClient({ token: testToken });
		expect(client.baseUrl).toBe(PRODUCTION_BASE_URL);
	});

	test("uses custom baseUrl when provided", () => {
		const customUrl = "https://custom.example.com/api";
		const client = new MienvioClient({ token: testToken, baseUrl: customUrl });
		expect(client.baseUrl).toBe(customUrl);
	});

	test("setToken updates token at runtime", () => {
		const client = new MienvioClient({ token: testToken });
		const newToken = "new-token-456";
		client.setToken(newToken);
		expect(client.config.token).toBe(newToken);
	});

	test("default timeout is 30 seconds", () => {
		const client = new MienvioClient({ token: testToken });
		expect(client.config.timeout).toBe(30_000);
	});

	test("custom timeout is respected", () => {
		const client = new MienvioClient({ token: testToken, timeout: 10_000 });
		expect(client.config.timeout).toBe(10_000);
	});

	test("composes all resource classes", () => {
		const client = new MienvioClient({ token: testToken });
		expect(client.rates).toBeDefined();
		expect(client.shipments).toBeDefined();
		expect(client.purchases).toBeDefined();
	});
});
