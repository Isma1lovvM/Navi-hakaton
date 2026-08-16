import { z } from "zod";

export const businessSchema = z.object({
  name: z.string().min(2, "Nomi kamida 2 ta belgidan iborat bo'lishi kerak"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Faqat kichik harflar, raqamlar va tire (-)"),
  description: z.string().max(500).optional(),
  address: z.string().max(200).optional(),
  phone: z.string().min(9, "Telefon raqami noto'g'ri").optional(),
});
export type BusinessInput = z.infer<typeof businessSchema>;

const timeString = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "HH:MM formatida bo'lishi kerak");

export const businessHoursDaySchema = z
  .object({
    day_of_week: z.number().int().min(0).max(6),
    is_closed: z.boolean(),
    open_time: timeString.nullable(),
    close_time: timeString.nullable(),
    break_start: timeString.nullable().optional(),
    break_end: timeString.nullable().optional(),
  })
  .refine((d) => d.is_closed || (d.open_time && d.close_time && d.open_time < d.close_time), {
    message: "Ochilish vaqti yopilish vaqtidan oldin bo'lishi kerak",
    path: ["close_time"],
  });
export type BusinessHoursDayInput = z.infer<typeof businessHoursDaySchema>;
