import { connectDB } from '@/lib/mongodb';
import { ActivityLog } from '@/lib/models/ActivityLog';

type ActionType = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'upload';
type EntityType = 'blog' | 'product' | 'project' | 'skill' | 'music' | 'library' | 'file' | 'notification' | 'settings' | 'donation' | 'request';

interface LogActivityParams {
  action: ActionType;
  entityType: EntityType;
  entityId?: string;
  entityName?: string;
  description?: string;
  ip?: string;
  userAgent?: string;
}

export async function logActivity(params: LogActivityParams) {
  try {
    await connectDB();
    await ActivityLog.create({
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      entityName: params.entityName,
      description: params.description || `${params.action} ${params.entityType}${params.entityName ? `: ${params.entityName}` : ''}`,
      ip: params.ip,
      userAgent: params.userAgent,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
