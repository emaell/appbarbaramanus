import { useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { useActiveChild } from '@/contexts/ActiveChildContext';
import * as storage from '@/lib/storage';
import type { Child, VaccineRecord } from '@shared/types';

/**
 * Hook para gerenciar lembretes automáticos baseados no perfil da criança
 */
export function useReminders() {
  const { addNotification } = useNotification();
  const { activeChild } = useActiveChild();

  useEffect(() => {
    if (!activeChild) return;

    // Executar verificações a cada 5 minutos
    const interval = setInterval(() => {
      checkReminders(activeChild);
    }, 5 * 60 * 1000);

    // Executar uma vez ao montar
    checkReminders(activeChild);

    return () => clearInterval(interval);
  }, [activeChild]);

  const checkReminders = async (child: Child) => {
    // Verificar próxima vacina
    await checkNextVaccine(child);

    // Verificar mamadas do dia
    await checkDailyFeedings(child);

    // Verificar recomendações por idade
    await checkAgeRecommendations(child);
  };

  const checkNextVaccine = async (child: Child) => {
    const vaccines = await storage.getVaccineRecordsForChild(child.id);
    const today = new Date().setHours(0, 0, 0, 0);

    // Encontrar próxima vacina pendente
    const nextVaccine = vaccines.find(
      (v: any) => v.status === 'pending' || v.status === 'scheduled'
    );

    if (nextVaccine && nextVaccine.suggestedDate) {
      const vaccineDate = new Date(nextVaccine.suggestedDate).setHours(0, 0, 0, 0);
      const daysUntil = Math.floor((vaccineDate - today) / (1000 * 60 * 60 * 24));

      // Notificar se falta 7 dias ou menos
      if (daysUntil >= 0 && daysUntil <= 7 && daysUntil !== -1) {
        const lastNotified = sessionStorage.getItem(`vaccine-notif-${nextVaccine.id}`);
        if (!lastNotified || Date.now() - parseInt(lastNotified) > 24 * 60 * 60 * 1000) {
          addNotification({
            type: 'reminder',
            title: '💉 Vacina próxima',
            message: `Vacina agendada em ${daysUntil} dias`,
            severity: daysUntil <= 3 ? 'high' : 'medium',
            duration: 6000,
          });
          sessionStorage.setItem(`vaccine-notif-${nextVaccine.id}`, Date.now().toString());
        }
      }
    }
  };

  const checkDailyFeedings = async (child: Child) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const feedings = await storage.getFeedingSessionsForChild(child.id);

    const todayFeedings = feedings.filter((f) => f.date === today);

    // Alertar se menos de 8 mamadas no dia (para bebês menores de 6 meses)
    const ageMonths = Math.floor((Date.now() - child.dateOfBirth) / (1000 * 60 * 60 * 24 * 30));
    if (ageMonths < 6 && todayFeedings.length < 8) {
      const lastNotified = sessionStorage.getItem('feeding-reminder');
      const now = Date.now();

      // Notificar apenas uma vez por dia, no final do dia
      if (!lastNotified || now - parseInt(lastNotified) > 24 * 60 * 60 * 1000) {
        const hour = new Date().getHours();
        if (hour >= 20) {
          // Mostrar apenas após 20h
          addNotification({
            type: 'reminder',
            title: '🍼 Lembrante de mamadas',
            message: `${todayFeedings.length} mamadas registradas hoje. Recomendado: 8-12`,
            severity: 'medium',
            duration: 5000,
          });
          sessionStorage.setItem('feeding-reminder', now.toString());
        }
      }
    }
  };

  const checkAgeRecommendations = async (child: Child) => {
    const childBirthDate = typeof child.dateOfBirth === 'number' ? child.dateOfBirth : new Date(child.dateOfBirth).getTime();
    const ageMonths = Math.floor((Date.now() - childBirthDate) / (1000 * 60 * 60 * 24 * 30));

    // Recomendações por idade
    const recommendations: Record<number, { title: string; message: string }> = {
      6: {
        title: '🥄 Introdução alimentar',
        message: 'Seu bebê completou 6 meses! Hora de começar a introdução alimentar.',
      },
      12: {
        title: '🎂 Um ano de vida',
        message: 'Parabéns! Seu bebê completou 1 ano. Consulte o pediatra para próximos passos.',
      },
      24: {
        title: '🎈 Dois anos de vida',
        message: 'Seu bebê completou 2 anos! Continue acompanhando o desenvolvimento.',
      },
    };

    const recommendation = recommendations[ageMonths];
    if (recommendation) {
      const lastNotified = sessionStorage.getItem(`milestone-${ageMonths}`);
      if (!lastNotified) {
        addNotification({
          type: 'reminder',
          title: recommendation.title,
          message: recommendation.message,
          severity: 'high',
          duration: 8000,
        });
        sessionStorage.setItem(`milestone-${ageMonths}`, Date.now().toString());
      }
    }
  };
}
