import { useEffect } from 'react';
import { X, CheckCircle, Info, AlertCircle, Bell } from 'lucide-react';
import { Notification } from '@shared/notification-types';
import { cn } from '@/lib/utils';

interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

export function Toast({ notification, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!notification.duration || notification.duration <= 0) return;

    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, notification.duration);

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'reminder':
        return <Bell className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'reminder':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-900';
      case 'error':
        return 'text-red-900';
      case 'warning':
        return 'text-yellow-900';
      case 'reminder':
        return 'text-blue-900';
      default:
        return 'text-blue-900';
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in fade-in slide-in-from-top-2 duration-300',
        getBgColor(),
        getTextColor()
      )}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{notification.title}</p>
        <p className="text-sm opacity-90 mt-1">{notification.message}</p>
        {notification.action && (
          <button
            onClick={() => {
              notification.action?.onClick();
              onDismiss(notification.id);
            }}
            className="text-sm font-medium mt-2 underline hover:opacity-75 transition-opacity"
          >
            {notification.action.label}
          </button>
        )}
      </div>

      {notification.dismissible && (
        <button
          onClick={() => onDismiss(notification.id)}
          className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
