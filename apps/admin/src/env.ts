import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().optional(),
		RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
	},
	client: {},
	experimental__runtimeEnv: {},
});
