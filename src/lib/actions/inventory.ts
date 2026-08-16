"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentMembership } from "@/lib/permissions/get-current-membership";
import { canManageInventory } from "@/lib/permissions/roles";
import { inventoryAdjustmentSchema, productSchema } from "@/lib/validation/inventory";
import type { Product } from "@/types/database";

export async function listProducts(businessId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", businessId)
    .order("name", { ascending: true });
  return data ?? [];
}

export async function createProduct(input: unknown) {
  const membership = await requireCurrentMembership();
  if (!canManageInventory(membership)) return { error: "Ombor faqat egasiga ochiq." };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .insert({ ...parsed.data, business_id: membership.businessId });

  if (error) return { error: "Mahsulot qo'shishda xatolik." };

  revalidatePath("/dashboard/inventory");
  return { success: true };
}

export async function adjustInventory(input: unknown) {
  const membership = await requireCurrentMembership();
  if (!canManageInventory(membership)) return { error: "Ombor faqat egasiga ochiq." };

  const parsed = inventoryAdjustmentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri." };

  const supabase = await createClient();

  // Compare-and-swap on the quantity we read, so two concurrent adjustments
  // can't silently overwrite each other (no raw SQL transaction available
  // through PostgREST without a dedicated RPC). Retry a few times on conflict.
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: product } = await supabase
      .from("products")
      .select("id, quantity")
      .eq("id", parsed.data.product_id)
      .eq("business_id", membership.businessId)
      .single();

    if (!product) return { error: "Mahsulot topilmadi." };

    const newQuantity = Math.max(0, Number(product.quantity) + parsed.data.change);

    const { data: updated, error: updateErr } = await supabase
      .from("products")
      .update({ quantity: newQuantity })
      .eq("id", product.id)
      .eq("quantity", product.quantity)
      .select("id");

    if (updateErr) return { error: "Yangilashda xatolik yuz berdi." };
    if (updated && updated.length > 0) break;
    if (attempt === 2) return { error: "Boshqa o'zgarish bilan to'qnashdi, qayta urinib ko'ring." };
  }

  await supabase.from("inventory_transactions").insert({
    business_id: membership.businessId,
    product_id: parsed.data.product_id,
    change: parsed.data.change,
    reason: parsed.data.reason,
  });

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
  return { success: true };
}
