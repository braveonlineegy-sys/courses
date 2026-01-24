import { client } from "@/lib/client";

type GetAllFn = typeof client.api.university.$get;

type PromiseResponse = ReturnType<GetAllFn>;

type FullResponse = PromiseResponse extends Promise<infer T> ? T : never;
type ActualJson = FullResponse extends { json(): Promise<infer J> } ? J : never;

type SuccessResponse = Extract<ActualJson, { success: true }>;

export type University = SuccessResponse["data"]["items"][number];
