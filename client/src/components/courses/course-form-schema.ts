import { z } from "zod";
import { createCourseSchema } from "shared";

// Local schema to handle File objects
export const formSchema = createCourseSchema
  .extend({
    fileKey: z.custom<File | string>(
      (val) => val instanceof File || typeof val === "string",
      "Image is required",
    ),
    pdfLink: z
      .custom<
        File | string
      >((val) => val instanceof File || typeof val === "string")
      .optional(),
    teacherId: z.string().optional(), // Make optional here to allow admin selection flow
  })
  .omit({ levelId: true }) // levelId is injected by the parent context
  .refine((data) => data.fileKey, {
    message: "Image is required",
    path: ["fileKey"],
  });

export type FormValues = z.infer<typeof formSchema>;
