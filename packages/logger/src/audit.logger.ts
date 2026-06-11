export interface AuditLogEntry {
  timestamp: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  ipAddress: string;
  correlationId: string;
  tenantId: string;
}

export function logAuditEvent(entry: AuditLogEntry): void {
  // In production this writes to CloudWatch Logs with permanent retention
  // The stream name is: /psl-one/<service>/audit
  console.log(JSON.stringify({ level: 'AUDIT', ...entry }));
}
