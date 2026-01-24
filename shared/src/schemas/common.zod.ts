import z from "zod";

export const paginationSchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .default(10),
  search: z.string().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
