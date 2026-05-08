import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useActiveChild } from '@/contexts/ActiveChildContext';
import { ReviewCarousel } from '@/components/ReviewCarousel';
import { useReminders } from '@/hooks/useReminders';
import {
  AlertCircle,
  Baby,
  BookOpen,
  CalendarClock,
  ChevronRight,
  Download,
  HeartPulse,
  MessageCircle,
  Moon,
  Play,
  Ruler,
  Sparkles,
  Stethoscope,
  Syringe,
} from 'lucide-react';
import { CONTACT, DOCTOR, EDUCATIONAL_MESSAGES, GALLERY_ITEMS, MATERIALS, REVIEWS, VIDEOS, VACCINES } from '@shared/constants';
import * as storage from '@/lib/storage';
import type { DiaperEntry, FeedingSession, GeneralNote, GrowthRecord, SleepEntry, SymptomEntry } from '@shared/types';

type DashboardState = {
  growth?: GrowthRecord;
  feeding?: FeedingSession;
  diaper?: DiaperEntry;
  sleep?: SleepEntry;
  symptom?: SymptomEntry;
  note?: GeneralNote;
};

function calculateAge(dateOfBirth: number) {
  const now = new Date();
  const birth = new Date(dateOfBirth);
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += previousMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days, totalMonths: years * 12 + months };
}

function formatDateTime(ts?: number) {
  if (!ts) return 'Sem registro';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(ts));
}

function addMonths(timestamp: number, months: number) {
  const date = new Date(timestamp);
  date.setMonth(date.getMonth() + months);
  return date;
}

function getNextVaccine(dateOfBirth: number) {
  const now = new Date();
  return VACCINES.map((vaccine) => ({ ...vaccine, suggestedDate: addMonths(dateOfBirth, vaccine.recommendedAgeMonths) }))
    .filter((vaccine) => vaccine.suggestedDate.getTime() >= now.getTime())
    .sort((a, b) => a.suggestedDate.getTime() - b.suggestedDate.getTime())[0];
}

const quickActions = [
  { label: 'Mamada', icon: Baby, href: '/diary?tab=feeding', tone: 'from-[#FCEAE5] to-[#FFF7F3]' },
  { label: 'Medida', icon: Ruler, href: '/growth', tone: 'from-[#EAF5FF] to-[#F7FCFE]' },
  { label: 'Fralda', icon: HeartPulse, href: '/diary?tab=diaper', tone: 'from-[#EAF7EF] to-[#F8FCF9]' },
  { label: 'Sono', icon: Moon, href: '/diary?tab=sleep', tone: 'from-[#F0EDFF] to-[#FAF8FF]' },
  { label: 'Sintoma', icon: AlertCircle, href: '/diary?tab=symptoms', tone: 'from-[#FFF4E3] to-[#FFF9F0]' },
  { label: 'Materiais', icon: BookOpen, href: '/content?tab=materials', tone: 'from-[#F5F0EC] to-[#FFFAF7]' },
];

export default function Today() {
  const { activeChild, isLoading } = useActiveChild();
  const [, navigate] = useLocation();
  useReminders();
  const [dashboard, setDashboard] = useState<DashboardState>({});

  useEffect(() => {
    async function load() {
      if (!activeChild) return;
      const [growth, feeding, diapers, sleep, symptoms, notes] = await Promise.all([
        storage.getGrowthRecordsForChild(activeChild.id),
        storage.getFeedingSessionsForChild(activeChild.id),
        storage.getDiaperEntriesForChild(activeChild.id),
        storage.getSleepEntriesForChild(activeChild.id),
        storage.getSymptomEntriesForChild(activeChild.id),
        storage.getGeneralNotesForChild(activeChild.id),
      ]);
      setDashboard({ growth: growth[0], feeding: feeding[0], diaper: diapers[0], sleep: sleep[0], symptom: symptoms[0], note: notes[0] });
    }
    load();
  }, [activeChild]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            <p className="text-muted-foreground">Carregando o cuidado...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!activeChild) {
    return (
      <AppLayout>
        <div className="container space-y-5 py-5 sm:py-6">
          <section className="glass-card overflow-hidden">
            <div className="grid bg-gradient-to-br from-[#FFF7F3] via-white to-[#EAF7EF] md:grid-cols-[1.05fr_0.95fr]">
              <div className="relative z-10 p-5 pb-2 sm:p-7 md:p-10">
                <span className="medical-chip">App gratuito para famílias</span>
                <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-[#3D2C22] md:text-5xl">
                  Cuidar com<br />Dra. Bárbara
                </h1>
                <p className="mt-4 max-w-md text-base leading-relaxed text-[#6F5B50] md:text-lg">
                  Diário do bebê, crescimento, amamentação, materiais educativos e orientação segura em um só lugar.
                </p>
                <Button size="lg" className="mt-5 w-full rounded-2xl py-6 text-base font-extrabold shadow-md md:w-auto" onClick={() => navigate('/profile')}>
                  Cadastrar criança e começar
                  <ChevronRight className="ml-2" size={18} />
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">Os dados ficam salvos neste dispositivo no MVP.</p>
              </div>
              <div className="relative min-h-[300px] overflow-hidden bg-white/35 md:min-h-[460px]">
                <img
                  src={DOCTOR.heroImage}
                  alt="Dra. Bárbara Naves"
                  className="absolute inset-0 h-full w-full object-contain object-bottom px-4 pt-1 md:px-8"
                />
              </div>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-3" aria-label="Acessos principais do app">
            <button type="button" onClick={() => navigate('/content?tab=faq')} className="group rounded-[1.35rem] border border-[#F4D7CF] bg-white p-4 text-left shadow-[0_12px_28px_rgba(61,44,34,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-[#FFFAF7] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
              <Stethoscope className="mb-2 text-primary transition group-hover:scale-110" />
              <h3 className="font-extrabold text-[#3D2C22]">Pediatria com acolhimento</h3>
              <p className="mt-1 text-sm text-[#8B7264]">Conteúdo educativo e acompanhamento para a rotina da família.</p>
              <span className="mt-3 inline-flex items-center text-xs font-bold text-primary">Conhecer cuidados <ChevronRight className="ml-1 size-3" /></span>
            </button>
            <button type="button" onClick={() => navigate('/growth')} className="group rounded-[1.35rem] border border-[#D7EEF7] bg-white p-4 text-left shadow-[0_12px_28px_rgba(61,44,34,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-[#F7FCFE] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
              <Ruler className="mb-2 text-accent transition group-hover:scale-110" />
              <h3 className="font-extrabold text-[#3D2C22]">Crescimento e diário</h3>
              <p className="mt-1 text-sm text-[#8B7264]">Registre medidas, mamadas, fraldas, sono e sintomas.</p>
              <span className="mt-3 inline-flex items-center text-xs font-bold text-accent">Acompanhar bebê <ChevronRight className="ml-1 size-3" /></span>
            </button>
            <button type="button" onClick={() => navigate('/content?tab=materials')} className="group rounded-[1.35rem] border border-[#DDF1E5] bg-white p-4 text-left shadow-[0_12px_28px_rgba(61,44,34,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-secondary/50 hover:bg-[#F6FCF8] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40">
              <Download className="mb-2 text-secondary transition group-hover:scale-110" />
              <h3 className="font-extrabold text-[#3D2C22]">Materiais gratuitos</h3>
              <p className="mt-1 text-sm text-[#8B7264]">Cadernetas, BLW, introdução alimentar, sono e desenvolvimento.</p>
              <span className="mt-3 inline-flex items-center text-xs font-bold text-secondary">Ver materiais <ChevronRight className="ml-1 size-3" /></span>
            </button>
          </section>
        </div>
      </AppLayout>
    );
  }

  const age = calculateAge(activeChild.dateOfBirth);
  const nextVaccine = getNextVaccine(activeChild.dateOfBirth);
  const recommendedMaterials = MATERIALS.filter((m) => !m.ageIndicationMonths || (m.ageIndicationMonths.min <= age.totalMonths && m.ageIndicationMonths.max >= age.totalMonths));
  const featuredMaterial = recommendedMaterials[0] ?? MATERIALS[0];
  const featuredVideo = VIDEOS.find((video) => video.isFeatured) ?? VIDEOS[0];

  return (
    <AppLayout>
      <div className="container space-y-5 py-5 sm:space-y-7 sm:py-6">
        <section className="glass-card overflow-hidden">
          <div className="grid bg-gradient-to-br from-[#FFF7F3] via-white to-[#ECF8F1] md:grid-cols-[1.2fr_0.8fr]">
            <div className="relative z-10 p-5 sm:p-7 md:p-8">
              <p className="subtle-label">{greeting}</p>
              <h1 className="mt-1 text-3xl font-black leading-tight tracking-tight text-[#3D2C22] md:text-4xl">Como está {activeChild.name} hoje?</h1>
              <p className="mt-2 text-sm text-[#6F5B50] md:text-base">
                {age.years > 0 && `${age.years} ano${age.years !== 1 ? 's' : ''}, `}
                {age.months} mês{age.months !== 1 ? 'es' : ''} e {age.days} dia{age.days !== 1 ? 's' : ''} de vida.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="medical-chip">{activeChild.feedingType === 'breastfeeding' ? 'Aleitamento' : activeChild.feedingType === 'formula' ? 'Fórmula' : 'Misto'}</span>
                <span className="medical-chip">{activeChild.premature ? 'Prematuro' : 'A termo'}</span>
              </div>
            </div>
            <div className="relative min-h-[220px] overflow-hidden bg-white/30 md:min-h-[300px]">
              <img src={DOCTOR.heroImage} alt="Dra. Bárbara Naves" className="absolute inset-0 h-full w-full object-contain object-bottom px-3" />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="p-4"><p className="subtle-label">Última mamada</p><p className="mt-2 font-black text-[#3D2C22]">{formatDateTime(dashboard.feeding?.startTime)}</p></Card>
          <Card className="p-4"><p className="subtle-label">Última medida</p><p className="mt-2 font-black text-[#3D2C22]">{dashboard.growth?.weight ? `${dashboard.growth.weight} kg` : 'Sem registro'}</p></Card>
          <Card className="p-4"><p className="subtle-label">Próxima vacina</p><p className="mt-2 line-clamp-2 font-black text-[#3D2C22]">{nextVaccine?.name ?? 'Revisar calendário'}</p></Card>
          <Card className="p-4"><p className="subtle-label">Última fralda</p><p className="mt-2 font-black text-[#3D2C22]">{formatDateTime(dashboard.diaper?.time)}</p></Card>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="section-title">Registros rápidos</h2><Button variant="ghost" size="sm" onClick={() => navigate('/diary')}>Ver diário</Button></div>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.label} onClick={() => navigate(action.href)} className={`rounded-[1.35rem] bg-gradient-to-br ${action.tone} p-3 text-left shadow-sm ring-1 ring-black/5 transition active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-md`}>
                  <Icon size={23} className="mb-3 text-[#4b5b52]" />
                  <span className="text-sm font-bold text-[#31423a]">{action.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden p-0">
            <div className="grid md:grid-cols-[0.92fr_1fr]">
              <div className="relative min-h-56 overflow-hidden bg-muted"><img src={GALLERY_ITEMS[2].imageUrl} alt={GALLERY_ITEMS[2].title} className="h-full min-h-56 w-full object-cover" /></div>
              <div className="p-5"><span className="medical-chip">Cuidado de verdade</span><h2 className="mt-4 text-2xl font-black leading-tight text-[#3D2C22]">Consulta com leveza para família e criança</h2><p className="mt-3 text-sm text-muted-foreground">Galeria organizada com fotos reais e autorização expressa quando houver crianças.</p><Button className="mt-5 w-full rounded-2xl" onClick={() => navigate('/content?tab=gallery')}>Ver galeria</Button></div>
            </div>
          </Card>
          <Card className="p-5"><BookOpen className="mb-3 text-primary" /><p className="subtle-label">Material recomendado</p><h3 className="mt-2 text-xl font-black text-[#3D2C22]">{featuredMaterial.title}</h3><p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{featuredMaterial.description}</p><div className="mt-5 flex gap-2"><Button className="flex-1 rounded-2xl" onClick={() => window.open(featuredMaterial.fileName || '#', '_blank')}>Abrir</Button><Button variant="outline" className="rounded-2xl" onClick={() => navigate('/content')}>Todos</Button></div></Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="overflow-hidden p-0"><div className="relative aspect-video bg-muted"><img src={featuredVideo.thumbnailUrl || DOCTOR.aboutImage} alt={featuredVideo.title} className="h-full w-full object-cover" /><div className="absolute inset-0 flex items-center justify-center bg-black/15"><div className="rounded-full bg-white/90 p-4 text-primary shadow-lg"><Play fill="currentColor" /></div></div></div><div className="p-5"><p className="subtle-label">Vídeo em destaque</p><h3 className="mt-2 text-xl font-black text-[#3D2C22]">{featuredVideo.title}</h3><p className="mt-2 text-sm text-muted-foreground">{featuredVideo.description}</p><Button className="mt-4 w-full rounded-2xl" onClick={() => navigate('/content?tab=videos')}>Abrir vídeos</Button></div></Card>
          <Card className="p-5"><Syringe className="mb-3 text-secondary" /><p className="subtle-label">Vacinas</p><h3 className="mt-2 text-xl font-black text-[#3D2C22]">Calendário informativo</h3><p className="mt-2 text-sm text-muted-foreground">Organize a rotina, mas confirme sempre com a pediatra ou serviço de vacinação.</p><Button variant="outline" className="mt-5 w-full rounded-2xl" onClick={() => navigate('/profile?tab=vaccines')}><CalendarClock className="mr-2" size={16} /> Ver vacinas</Button></Card>
        </section>

        {REVIEWS.length > 0 ? <ReviewCarousel reviews={REVIEWS} /> : <Card className="p-5"><Sparkles className="mb-3 text-primary" /><h3 className="font-black text-[#3D2C22]">Avaliações reais serão adicionadas aqui</h3><p className="mt-1 text-sm text-muted-foreground">O app não usa depoimentos fictícios.</p></Card>}

        <Card className="border-primary/20 bg-primary/5 p-5"><MessageCircle className="mb-3 text-primary" /><h3 className="font-bold text-[#3D2C22]">Precisa agendar ou falar com a clínica?</h3><p className="mt-1 text-sm text-muted-foreground">Fale com o Instituto Naves pelo WhatsApp. Este app é educativo e não substitui consulta médica.</p><Button className="mt-4 w-full rounded-2xl" onClick={() => window.open(CONTACT.whatsappUrl, '_blank')}>Chamar no WhatsApp</Button></Card>
        <p className="px-1 text-center text-xs text-muted-foreground">{EDUCATIONAL_MESSAGES.symptoms.alarm}</p>
      </div>
    </AppLayout>
  );
}
