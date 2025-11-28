import { publicProcedure, router } from "@missingstack/api/index";

export const toolsRouter = router({
	getAllTools: publicProcedure.query(async () => {
		return [
			{ id: 1, name: "Tool A" },
			{ id: 2, name: "Tool B" },
		];
	}),
});
