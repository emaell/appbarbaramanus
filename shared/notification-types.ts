/**
 * Tipos e interfaces para o sistema de notificações
 */

export type NotificationType = 
  | 'success'      // Ação completada com sucesso
  | 'info'         // Informação geral
  | 'warning'      // Aviso importante
  | 'error'        // Erro na ação
  | 'reminder';    // Lembrete do sistema

export type NotificationSeverity = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity?: NotificationSeverity;
  timestamp: number;
  duration?: number; // em ms, null = permanente até fechar
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean; // padrão: true
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}
