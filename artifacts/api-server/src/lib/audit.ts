import { Request } from "express";
import { db, auditLogsTable } from "@workspace/db";

export async function logAudit(
  req: Request,
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "RESTORE",
  entity: string,
  entityId?: string | number | null,
  detail?: string | null,
): Promise<void> {
  try {
    const adminUser = (req as any).adminUser ?? (req as any).authUser;
    if (!adminUser) return;
    await db.insert(auditLogsTable).values({
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      action,
      entity,
      entityId: entityId != null ? String(entityId) : null,
      detail: detail ?? null,
      ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip ?? null,
    });
  } catch {
    // Audit logging must never crash the main request
  }
}
