import { useNotification } from '@/contexts/NotificationContext';
import { Toast } from './Toast';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useState } from 'react';

export function NotificationCenter() {
  const { notifications, removeNotification, clearAll, unreadCount } = useNotification();
  const [showPanel, setShowPanel] = useState(false);

  return (
    <>
      {/* Toast Container - canto superior direito */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {notifications
          .filter((n) => n.type !== 'reminder' || !showPanel)
          .slice(-3) // Mostrar apenas últimas 3 notificações
          .map((notification) => (
            <div key={notification.id} className="pointer-events-auto">
              <Toast notification={notification} onDismiss={removeNotification} />
            </div>
          ))}
      </div>

      {/* Badge + Botão de Notificações - na navegação */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowPanel(!showPanel)}
          className="relative"
          aria-label={`Notificações (${unreadCount})`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Notification Panel - modal com histórico */}
      {showPanel && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-end md:items-center md:justify-center">
          <Card className="w-full md:w-96 md:max-h-96 rounded-b-none md:rounded-lg bg-white shadow-xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-lg">Notificações</h2>
              <button
                onClick={() => setShowPanel(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 bg-muted rounded-lg text-sm space-y-1 cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => {
                        notification.action?.onClick();
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <p className="font-medium">{notification.title}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  className="w-full"
                >
                  Limpar tudo
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
