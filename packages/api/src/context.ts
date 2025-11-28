import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

type CreateContextReq = FetchCreateContextFnOptions["req"];
export async function createContext(_req: CreateContextReq) {
	return { session: null };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
