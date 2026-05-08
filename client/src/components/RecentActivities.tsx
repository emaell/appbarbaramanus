import React from 'react';
import { Droplet, Moon, Activity, Ruler } from 'lucide-react';
import { Card } from './ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Activity {
  type: 'feeding' | 'diaper' | 'sleep' | 'growth';
  time: number;
  label: string;
  details?: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  if (activities.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'feeding':
        return <Droplet size={18} className="text-primary" />;
      case 'diaper':
        return <Activity size={18} className="text-secondary" />;
      case 'sleep':
        return <Moon size={18} className="text-accent" />;
      case 'growth':
        return <Ruler size={18} className="text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Ultimas atividades</h3>
      <div className="space-y-2">
        {activities.slice(0, 4).map((activity, index) => (
          <Card key={index} className="p-3 flex items-center gap-3">
            <div className="flex-shrink-0">{getIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{activity.label}</p>
              {activity.details && (
                <p className="text-xs text-muted-foreground">{activity.details}</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(activity.time), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
