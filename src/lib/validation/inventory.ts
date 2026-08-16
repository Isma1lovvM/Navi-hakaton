import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Mahsulot nomi kiritilishi shart"),
  unit: z.string().min(1).default("dona"),
  quantity: z.coerce.number().nonnegative(),
  min_quantity: z.coerce.number().nonnegative(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const inventoryAdjustmentSchema = z.object({
  product_id: z.string().uuid(),
  change: z.coerce.number().refine((n) => n !== 0, "O'zgarish 0 bo'lishi mumkin emas"),
  reason: z.enum(["RESTOCK", "USAGE", "ADJUSTMENT"]),
});
export type InventoryAdjustmentInput = z.infer<typeof inventoryAdjustmentSchema>;
