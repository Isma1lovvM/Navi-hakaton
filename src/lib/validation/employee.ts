import { z } from "zod";

export const employeeInviteSchema = z.object({
  full_name: z.string().min(2, "Ism kiritilishi shart"),
  email: z.string().email("Email noto'g'ri"),
  phone: z.string().min(9, "Telefon raqami noto'g'ri").optional(),
  resource_name: z.string().min(1, "Xodim qaysi resurs (usta) sifatida ishlashini kiriting"),
});
export type EmployeeInviteInput = z.infer<typeof employeeInviteSchema>;

// Editing an existing employee: email/akkaunt o'zgarmaydi (u allaqachon
// yaratilgan), faqat ism/telefon/resurs nomi tahrirlanadi.
export const employeeEditSchema = z.object({
  full_name: z.string().min(2, "Ism kiritilishi shart"),
  phone: z.string().min(9, "Telefon raqami noto'g'ri").optional(),
  resource_name: z.string().min(1, "Xodim qaysi resurs (usta) sifatida ishlashini kiriting"),
});
export type EmployeeEditInput = z.infer<typeof employeeEditSchema>;

export const resourceHoursDaySchema = z
  .object({
    day_of_week: z.number().int().min(0).max(6),
    is_off: z.boolean(),
    start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable(),
    end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable(),
  })
  .refine((d) => d.is_off || (d.start_time && d.end_time && d.start_time < d.end_time), {
    message: "Boshlanish vaqti tugash vaqtidan oldin bo'lishi kerak",
    path: ["end_time"],
  });
export type ResourceHoursDayInput = z.infer<typeof resourceHoursDaySchema>;
