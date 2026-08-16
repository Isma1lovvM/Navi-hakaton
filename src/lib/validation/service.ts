import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(2, "Xizmat nomi kiritilishi shart"),
  description: z.string().max(300).optional(),
  duration_minutes: z.coerce.number().int().positive("Davomiylik 0 dan katta bo'lishi kerak"),
  price: z.coerce.number().nonnegative("Narx manfiy bo'lishi mumkin emas"),
  is_active: z.boolean().default(true),
});
export type ServiceInput = z.infer<typeof serviceSchema>;
