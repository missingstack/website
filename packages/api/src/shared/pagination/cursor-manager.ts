import { createHmac, timingSafeEqual } from "node:crypto";
import type { BaseCursorState, EncodedCursor } from "./types";

/**
 * Cursor validation result
 */
export type CursorValidationResult<T extends BaseCursorState> =
	| { valid: true; state: T }
	| {
			valid: false;
			reason:
				| "missing"
				| "invalid_format"
				| "expired"
				| "tampered"
				| "sort_mismatch";
			shouldFallback?: boolean;
	  };

/**
 * Manages cursor encoding, decoding, and validation with HMAC signing.
 * Provides secure, tamper-proof cursor pagination with expiration support.
 */
export class CursorManager<T extends BaseCursorState = BaseCursorState> {
	private readonly cursorTTL: number;
	private readonly secretKey: string;

	constructor(
		options: {
			ttlMinutes?: number;
			secretKey?: string;
		} = {},
	) {
		this.cursorTTL = (options.ttlMinutes ?? 60) * 60 * 1000;
		this.secretKey =
			options.secretKey ||
			process.env.CURSOR_SIGNING_SECRET ||
			"dev-secret-change-in-production";
	}

	/**
	 * Encode cursor state with expiration and HMAC signature
	 */
	encode(state: T, sortBy: string): string {
		const payload: EncodedCursor<T> = {
			id: state.id,
			sortBy,
			timestamp: Date.now(),
			fields: this.extractFields(state),
		};

		// Add HMAC signature for tamper detection
		const base64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
		const signature = this.generateSignature(base64);

		return `${base64}.${signature}`;
	}

	/**
	 * Decode and validate cursor
	 */
	decode(cursor?: string | null, currentSortBy?: string): T | null {
		if (!cursor) return null;

		try {
			// Split signature from payload
			const [base64, signature] = cursor.split(".");
			if (!base64 || !signature) {
				return null;
			}

			// Validate signature first (timing-safe comparison)
			if (!this.validateSignature(base64, signature)) {
				return null;
			}

			const json = Buffer.from(base64, "base64url").toString("utf8");
			const payload = JSON.parse(json) as EncodedCursor<T>;

			// Validate required fields
			if (!this.isValidPayload(payload)) {
				return null;
			}

			// Check expiration
			if (this.isExpired(payload.timestamp)) {
				return null;
			}

			// Validate sort consistency
			if (currentSortBy && payload.sortBy !== currentSortBy) {
				return null; // Sort changed - cursor invalid
			}

			return this.hydrateCursorState(payload);
		} catch {
			return null;
		}
	}

	/**
	 * Validate cursor with detailed result
	 */
	validate(
		cursor?: string | null,
		currentSortBy?: string,
	): CursorValidationResult<T> {
		if (!cursor) {
			return {
				valid: false,
				reason: "missing",
				shouldFallback: true,
			};
		}

		const state = this.decode(cursor, currentSortBy);
		if (!state) {
			return {
				valid: false,
				reason: "invalid_format",
				shouldFallback: true,
			};
		}

		return { valid: true, state };
	}

	/**
	 * Extract sort-relevant fields from cursor state
	 */
	private extractFields(state: T): Partial<Omit<T, "id">> {
		const { id: _id, ...fields } = state;
		return fields;
	}

	/**
	 * Hydrate cursor state from payload
	 */
	private hydrateCursorState(payload: EncodedCursor<T>): T {
		const state: Partial<T> = { id: payload.id } as Partial<T>;

		for (const [key, value] of Object.entries(payload.fields)) {
			if (value === undefined || value === null) continue;

			// Handle date strings
			if (typeof value === "string" && this.isISODateString(value)) {
				const date = new Date(value);
				if (!Number.isNaN(date.getTime())) {
					(state as Record<string, unknown>)[key] = date;
					continue;
				}
			}

			(state as Record<string, unknown>)[key] = value;
		}

		return state as T;
	}

	private isValidPayload(payload: unknown): payload is EncodedCursor<T> {
		return (
			typeof payload === "object" &&
			payload !== null &&
			"id" in payload &&
			typeof (payload as EncodedCursor<T>).id === "string" &&
			"sortBy" in payload &&
			typeof (payload as EncodedCursor<T>).sortBy === "string" &&
			"timestamp" in payload &&
			typeof (payload as EncodedCursor<T>).timestamp === "number" &&
			"fields" in payload &&
			typeof (payload as EncodedCursor<T>).fields === "object"
		);
	}

	private isExpired(timestamp: number): boolean {
		return Date.now() - timestamp > this.cursorTTL;
	}

	private isISODateString(value: string): boolean {
		return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value);
	}

	/**
	 * Generate HMAC signature using timing-safe comparison
	 */
	private generateSignature(data: string): string {
		const hmac = createHmac("sha256", this.secretKey);
		hmac.update(data);
		return hmac.digest("hex");
	}

	/**
	 * Validate signature using timing-safe comparison
	 */
	private validateSignature(data: string, expectedSignature: string): boolean {
		try {
			const computed = this.generateSignature(data);
			return timingSafeEqual(
				Buffer.from(computed),
				Buffer.from(expectedSignature),
			);
		} catch {
			return false;
		}
	}
}
