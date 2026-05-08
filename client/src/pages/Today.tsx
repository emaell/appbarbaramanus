import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useActiveChild } from '@/contexts/ActiveChildContext';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertCircle,
  Baby,
  BookOpen,
  CalendarClock,
  ChevronRight,
  Download,
  FileText,
  HeartPulse,
  Image as ImageIcon,
  MessageCircle,
  Moon,
  Play,
  Ruler,
  Sparkles,
  Stethoscope,
  Syringe,
} from 'lucide-react';
import { CONTACT, DOCTOR, EDUCATIONAL_MESSAGES, GALLERY_ITEMS, MATERIALS, REVIEWS, VIDEOS, VACCINES } from '@shared/constants';
import { ReviewCarousel } from '@/components/ReviewCarousel';
import { useReminders } from '@/hooks/useReminders';
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

  const totalMonths = years * 12 + months;
  return { years, months, days, totalMonths };
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
  return VACCINES.map((vaccine) => ({
    ...vaccine,
    suggestedDate: addMonths(dateOfBirth, vaccine.recommendedAgeMonths),
  }))
    .filter((vaccine) => vaccine.suggestedDate.getTime() >= now.getTime())
    .sort((a, b) => a.suggestedDate.getTime() - b.suggestedDate.getTime())[0];
}

const quickActions = [
  { label: 'Mamada', icon: Baby, href: '/diary?tab=feeding', tone: 'from-pink-100 to-rose-50' },
  { label: 'Medida', icon: Ruler, href: '/growth', tone: 'from-blue-100 to-sky-50' },
  { label: 'Fralda', icon: HeartPulse, href: '/diary?tab=diapers', tone: 'from-emerald-100 to-green-50' },
  { label: 'Sono', icon: Moon, href: '/diary?tab=sleep', tone: 'from-indigo-100 to-violet-50' },
  { label: 'Sintoma', icon: AlertCircle, href: '/diary?tab=symptoms', tone: 'from-amber-100 to-orange-50' },
  { label: 'Materiais', icon: BookOpen, href: '/content', tone: 'from-stone-100 to-yellow-50' },
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
      setDashboard({
        growth: growth[0],
        feeding: feeding[0],
        diaper: diapers[0],
        sleep: sleep[0],
        symptom: symptoms[0],
        note: notes[0],
      });
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
        <div className="container space-y-6 py-6">
          <section className="glass-card overflow-hidden">
            <div className="relative min-h-[520px] bg-gradient-to-br from-[#fff4f8] via-white to-[#eef8f2] md:min-h-[460px]">
              <img src={DOCTOR.heroImage} alt="Dra. Bárbara Naves" className="absolute inset-x-0 bottom-0 mx-auto h-[72%] w-full object-contain object-bottom opacity-95 md:right-0 md:left-auto md:h-full md:w-[52%]" />
              <div className="relative z-10 flex min-h-[520px] flex-col justify-between p-6 md:min-h-[460px] md:w-[58%] md:p-10">
                <div>
                  <span className="medical-chip">App gratuito para famílias</span>
                  <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-[#31423a] md:text-5xl">
                    Cuidar com<br />Dra. Bárbara
                  </h1>
                  <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">
                    Diário do bebê, crescimento, amamentação, materiais educativos e orientação segura em um só lugar.
                  </p>
                </div>
                <div className="space-y-3">
                  <Button size="lg" className="w-full rounded-2xl bg-primary py-6 text-base font-bold md:w-auto" onClick={() => navigate('/profile')}>
                    Cadastrar criança e começar
                    <ChevronRight className="ml-2" size={18} />
                  </Button>
                  <p className="text-xs text-muted-foreground">Os dados ficam salvos neste dispositivo no MVP.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-3" aria-label="Acessos principais do app">
            <button
              type="button"
              onClick={() => navigate('/content?tab=faq')}
              className="group rounded-[1.35rem] border border-[#F4D7CF] bg-white p-4 text-left shadow-[0_12px_28px_rgba(61,44,34,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-[#FFFAF7] hover:shadow-[0_16px_36px_rgba(61,44,34,0.10)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Abrir conteúdos sobre pediatria e cuidados"
            >
              <Stethoscope className="mb-2 text-primary transition group-hover:scale-110" />
              <h3 className="font-extrabold text-[#3D2C22]">Pediatria com acolhimento</h3>
              <p className="mt-1 text-sm text-[#8B7264]">Conteúdo educativo e acompanhamento para a rotina da família.</p>
              <span className="mt-3 inline-flex items-center text-xs font-bold text-primary">Conhecer cuidados <ChevronRight className="ml-1 size-3" /></span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/growth')}
              className="group rounded-[1.35rem] border border-[#D7EEF7] bg-white p-4 text-left shadow-[0_12px_28px_rgba(61,44,34,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-[#F7FCFE] hover:shadow-[0_16px_36px_rgba(61,44,34,0.10)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              aria-label="Abrir crescimento e diário do bebê"
            >
              <Ruler className="mb-2 text-accent transition group-hover:scale-110" />
              <h3 className="font-extrabold text-[#3D2C22]">Crescimento e diário</h3>
              <p className="mt-1 text-sm text-[#8B7264]">Registre medidas, mamadas, fraldas, sono e sintomas.</p>
              <span className="mt-3 inline-flex items-center text-xs font-bold text-accent">Acompanhar bebê <ChevronRight className="ml-1 size-3" /></span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/content?tab=materials')}
              className="group rounded-[1.35rem] border border-[#DDF1E5] bg-white p-4 text-left shadow-[0_12px_28px_rgba(61,44,34,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-secondary/50 hover:bg-[#F6FCF8] hover:shadow-[0_16px_36px_rgba(61,44,34,0.10)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
              aria-label="Abrir materiais gratuitos"
            >
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
  const latestMeasurement = dashboard.growth;

  return (
    <AppLayout>
      <div className="container space-y-7 py-6">
        <section className="glass-card overflow-hidden">
          <div className="relative bg-gradient-to-br from-[#fff1f7] via-white to-[#ecf8f1] p-5 md:p-8">
            <img src={DOCTOR.heroImage} alt="Dra. Bárbara Naves" className="absolute bottom-0 right-0 h-48 w-44 object-contain opacity-90 md:h-72 md:w-72" />
            <div className="relative z-10 max-w-[68%] md:max-w-xl">
              <p className="subtle-label">{greeting}</p>
              <h1 className="mt-1 text-3xl font-black leading-tight tracking-tight md:text-4xl">
                Como está {activeChild.name} hoje?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                {age.years > 0 && `${age.years} ano${age.years !== 1 ? 's' : ''}, `}
                {age.months} mês{age.months !== 1 ? 'es' : ''} e {age.days} dia{age.days !== 1 ? 's' : ''} de vida.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="medical-chip">{activeChild.feedingType === 'breastfeeding' ? 'Aleitamento' : activeChild.feedingType === 'formula' ? 'Fórmula' : 'Misto'}</span>
                <span className="medical-chip">{activeChild.premature ? 'Prematuro' : 'A termo'}</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Registros rápidos</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/diary')}>Ver diário</Button>
          </div>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.label} onClick={() => navigate(action.href)} className={`rounded-[1.35rem] bg-gradient-to-br ${action.tone} p-3 text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md`}>
                  <Icon size={23} className="mb-3 text-[#4b5b52]" />
                  <span className="text-sm font-bold text-[#31423a]">{action.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-4">
          <Card className="p-4">
            <p className="subtle-label">Última mamada</p>
            <p className="mt-2 text-lg font-bold">{formatDateTime(dashboard.feeding?.startTime)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Registre para acompanhar rotina e dúvidas.</p>
          </Card>
          <Card className="p-4">
            <p className="subtle-label">Última medida</p>
            <p className="mt-2 text-lg font-bold">{latestMeasurement?.weight ? `${latestMeasurement.weight} kg` : 'Sem registro'}</p>
            <p className="mt-1 text-xs text-muted-foreground">Peso, altura e perímetro cefálico.</p>
          </Card>
          <Card className="p-4">
            <p className="subtle-label">Próxima vacina</p>
            <p className="mt-2 line-clamp-2 text-lg font-bold">{nextVaccine?.name ?? 'Revisar calendário'}</p>
            <p className="mt-1 text-xs text-muted-foreground">{nextVaccine ? formatDateTime(nextVaccine.suggestedDate.getTime()).split(',')[0] : 'Confirme com a pediatra.'}</p>
          </Card>
          <Card className="p-4">
            <p className="subtle-label">Última fralda</p>
            <p className="mt-2 text-lg font-bold">{formatDateTime(dashboard.diaper?.time)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Xixi, cocô e observações.</p>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden p-0">
            <div className="grid md:grid-cols-[0.92fr_1fr]">
              <div className="relative min-h-56 overflow-hidden bg-muted">
                <img src={GALLERY_ITEMS[2].imageUrl} alt={GALLERY_ITEMS[2].title} className="h-full min-h-56 w-full object-cover" />
                <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-primary shadow-sm">Atendimento autorizado</div>
              </div>
              <div className="p-5">
                <span className="medical-chip">Cuidado de verdade</span>
                <h2 className="mt-4 text-2xl font-black leading-tight">Consulta com leveza para família e criança</h2>
                <p className="mt-3 text-sm text-muted-foreground">As fotos reais deixam o app com rosto humano, mas sempre exigem autorização expressa dos responsáveis quando houver criança ou família.</p>
                <Button className="mt-5 w-full rounded-2xl" onClick={() => navigate('/content?tab=gallery')}>
                  <ImageIcon className="mr-2" size={16} /> Ver galeria
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <FileText className="mt-1 text-primary" />
              <div>
                <p className="subtle-label">Material recomendado</p>
                <h3 className="mt-2 text-xl font-black">{featuredMaterial.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{featuredMaterial.description}</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button className="flex-1 rounded-2xl" onClick={() => window.open(featuredMaterial.fileName || '#', '_blank')}>Abrir</Button>
              <Button variant="outline" className="rounded-2xl" onClick={() => navigate('/content')}>Todos</Button>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="overflow-hidden p-0">
            <div className="relative aspect-video bg-muted">
              <img src={featuredVideo.thumbnailUrl || DOCTOR.aboutImage} alt={featuredVideo.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                <div className="rounded-full bg-white/90 p-4 text-primary shadow-lg"><Play fill="currentColor" /></div>
              </div>
            </div>
            <div className="p-5">
              <p className="subtle-label">Vídeo em destaque</p>
              <h3 className="mt-2 text-xl font-black">{featuredVideo.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{featuredVideo.description}</p>
              <Button className="mt-4 w-full rounded-2xl" onClick={() => navigate('/content?tab=videos')}>Abrir vídeos</Button>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <Syringe className="mt-1 text-secondary" />
              <div>
                <p className="subtle-label">Vacinas</p>
                <h3 className="mt-2 text-xl font-black">Calendário informativo</h3>
                <p className="mt-2 text-sm text-muted-foreground">A lista ajuda a organizar a rotina, mas deve ser confirmada com a pediatra ou serviço de vacinação.</p>
              </div>
            </div>
            <Button variant="outline" className="mt-5 w-full rounded-2xl" onClick={() => navigate('/profile?tab=vaccines')}>
              <CalendarClock className="mr-2" size={16} /> Ver vacinas
            </Button>
          </Card>
        </section>

        {REVIEWS.length > 0 ? (
          <ReviewCarousel reviews={REVIEWS} />
        ) : (
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 text-primary" />
              <div className="flex-1">
                <p className="subtle-label">Avaliações</p>
                <h3 className="mt-2 font-black">Avaliações reais serão adicionadas aqui</h3>
                <p className="mt-1 text-sm text-muted-foreground">Não inseri avaliações fictícias. O app já tem espaço para carrossel e link externo.</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => window.open(CONTACT.googleReviewsUrl, '_blank')}>Ver no Google</Button>
              <Button className="flex-1 rounded-2xl" onClick={() => window.open(CONTACT.googleReviewWriteUrl, '_blank')}>Avaliar</Button>
            </div>
          </Card>
        )}

        <Card className="border-primary/20 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <MessageCircle className="mt-1 text-primary" />
            <div className="flex-1">
              <h3 className="font-bold">Precisa agendar ou tirar dúvida com a clínica?</h3>
              <p className="mt-1 text-sm text-muted-foreground">Fale com o Instituto Naves pelo WhatsApp. Este app é educativo e não substitui consulta médica.</p>
              <Button className="mt-4 w-full rounded-2xl" onClick={() => window.open(CONTACT.whatsappUrl, '_blank')}>
                Chamar no WhatsApp
              </Button>
            </div>
          </div>
        </Card>

        <p className="px-1 text-center text-xs text-muted-foreground">{EDUCATIONAL_MESSAGES.symptoms.alarm}</p>
      </div>
    </AppLayout>
  );
}
