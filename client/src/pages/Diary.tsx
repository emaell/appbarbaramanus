import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useActiveChild } from '@/contexts/ActiveChildContext';
import { useNotification } from '@/contexts/NotificationContext';
import { Activity, AlertCircle, Baby, Clock, FileText, HeartPulse, Moon, Pause, Play, Plus, RotateCcw, Thermometer, Utensils } from 'lucide-react';
import * as storage from '@/lib/storage';
import type { DiaperEntry, FeedingSession, GeneralNote, SleepEntry, SymptomEntry } from '@shared/types';

function getInitialTab() {
  if (typeof window === 'undefined') return 'feeding';
  return new URLSearchParams(window.location.search).get('tab') || 'feeding';
}

function formatClock(timestamp?: number) {
  if (!timestamp) return 'Sem registro';
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp));
}

function formatTimer(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const demoTimeline = [
  { time: '14:30', title: 'Mamada', detail: '12 min · seio esquerdo' },
  { time: '15:10', title: 'Fralda', detail: 'Xixi registrado' },
  { time: '16:20', title: 'Sono', detail: 'Cochilo de 45 min' },
];

export default function Diary() {
  const { activeChild } = useActiveChild();
  const { addNotification } = useNotification();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [feedingSessions, setFeedingSessions] = useState<FeedingSession[]>([]);
  const [diaperEntries, setDiaperEntries] = useState<DiaperEntry[]>([]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [symptomEntries, setSymptomEntries] = useState<SymptomEntry[]>([]);
  const [notes, setNotes] = useState<GeneralNote[]>([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [feedingForm, setFeedingForm] = useState({ rightBreast: false, leftBreast: false, notes: '' });
  const [diaperForm, setDiaperForm] = useState({ type: 'wet' as 'wet' | 'poop' | 'both', notes: '' });
  const [sleepForm, setSleepForm] = useState({ awakenings: 0, naps: 1, notes: '' });
  const [symptomForm, setSymptomForm] = useState({ symptomType: 'fever' as any, intensity: 'mild' as 'mild' | 'moderate' | 'severe', notes: '' });
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (!activeChild) return;
    loadData();
  }, [activeChild]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => setTimerSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const loadData = async () => {
    if (!activeChild) return;
    const [sessions, diapers, sleeps, symptoms, allNotes] = await Promise.all([
      storage.getFeedingSessionsForChild(activeChild.id),
      storage.getDiaperEntriesForChild(activeChild.id),
      storage.getSleepEntriesForChild(activeChild.id),
      storage.getSymptomEntriesForChild(activeChild.id),
      storage.getGeneralNotesForChild(activeChild.id),
    ]);
    setFeedingSessions(sessions);
    setDiaperEntries(diapers);
    setSleepEntries(sleeps);
    setSymptomEntries(symptoms);
    setNotes(allNotes);
  };

  const todaySummary = useMemo(() => ({
    feedings: feedingSessions.length,
    diapers: diaperEntries.length,
    naps: sleepEntries.reduce((total, item) => total + (item.naps || 0), 0),
    symptoms: symptomEntries.length,
  }), [feedingSessions, diaperEntries, sleepEntries, symptomEntries]);

  const saveFeeding = async () => {
    if (!activeChild) return;
    if (!feedingForm.rightBreast && !feedingForm.leftBreast) {
      alert('Selecione pelo menos um lado da mamada.');
      return;
    }
    const now = Date.now();
    await storage.addFeedingSession({
      id: `feeding-${now}`,
      childId: activeChild.id,
      date: new Date().setHours(0, 0, 0, 0),
      startTime: now - timerSeconds * 1000,
      endTime: now,
      durationMinutes: Math.max(1, Math.round(timerSeconds / 60)),
      rightBreast: feedingForm.rightBreast,
      leftBreast: feedingForm.leftBreast,
      pegQuality: 'unknown',
      maternalPain: false,
      babyContent: 'unknown',
      notes: feedingForm.notes,
      createdAt: now,
      updatedAt: now,
    });
    setTimerRunning(false);
    setTimerSeconds(0);
    setFeedingForm({ rightBreast: false, leftBreast: false, notes: '' });
    await loadData();
    addNotification({ type: 'success', title: 'Mamada registrada', message: 'Registro salvo neste dispositivo.', duration: 3500 });
  };

  const saveDiaper = async () => {
    if (!activeChild) return;
    const now = Date.now();
    await storage.addDiaperEntry({ id: `diaper-${now}`, childId: activeChild.id, date: new Date().setHours(0, 0, 0, 0), time: now, type: diaperForm.type, notes: diaperForm.notes, createdAt: now, updatedAt: now });
    setDiaperForm({ type: 'wet', notes: '' });
    await loadData();
    addNotification({ type: 'success', title: 'Fralda registrada', message: 'Troca salva no diário.', duration: 3000 });
  };

  const saveSleep = async () => {
    if (!activeChild) return;
    const now = Date.now();
    await storage.addSleepEntry({ id: `sleep-${now}`, childId: activeChild.id, date: new Date().setHours(0, 0, 0, 0), startTime: now - 45 * 60000, endTime: now, awakenings: sleepForm.awakenings, naps: sleepForm.naps, notes: sleepForm.notes, createdAt: now, updatedAt: now });
    setSleepForm({ awakenings: 0, naps: 1, notes: '' });
    await loadData();
    addNotification({ type: 'success', title: 'Sono registrado', message: 'Cochilo/sono salvo no diário.', duration: 3000 });
  };

  const saveSymptom = async () => {
    if (!activeChild) return;
    const now = Date.now();
    await storage.addSymptomEntry({ id: `symptom-${now}`, childId: activeChild.id, date: new Date().setHours(0, 0, 0, 0), startTime: now, symptomType: symptomForm.symptomType, intensity: symptomForm.intensity, notes: symptomForm.notes, createdAt: now, updatedAt: now });
    setSymptomForm({ symptomType: 'fever', intensity: 'mild', notes: '' });
    await loadData();
    addNotification({ type: symptomForm.intensity === 'severe' ? 'warning' : 'info', title: 'Sintoma registrado', message: 'Monitore e procure atendimento se houver piora.', duration: 4500 });
  };

  const saveNote = async () => {
    if (!activeChild || !noteText.trim()) return;
    const now = Date.now();
    await storage.addGeneralNote({ id: `note-${now}`, childId: activeChild.id, date: new Date().setHours(0, 0, 0, 0), content: noteText, createdAt: now, updatedAt: now });
    setNoteText('');
    await loadData();
  };

  if (!activeChild) {
    return (
      <AppLayout>
        <div className="container space-y-5 py-5">
          <section className="glass-card bg-gradient-to-br from-[#FCEAE5] via-white to-[#EAF7EF] p-5">
            <span className="medical-chip">Diário do bebê</span>
            <h1 className="mt-4 text-3xl font-black leading-tight text-[#3D2C22]">Registre a rotina com poucos toques</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6F5B50]">Cadastre uma criança para salvar mamadas, fraldas, sono, sintomas e observações neste dispositivo.</p>
            <Button className="mt-5 w-full rounded-2xl py-6" onClick={() => navigate('/profile')}><Plus className="mr-2" />Cadastrar criança</Button>
          </section>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Mamada', '14h30', Baby],
              ['Sono', '2 cochilos', Moon],
              ['Fraldas', '4 trocas', HeartPulse],
              ['Temperatura', '36,7 °C', Thermometer],
            ].map(([title, value, Icon]: any) => <Card key={title} className="p-4"><Icon className="mb-2 text-primary" /><p className="text-xs font-bold uppercase text-muted-foreground">{title}</p><p className="mt-1 text-lg font-black text-[#3D2C22]">{value}</p><p className="text-xs text-muted-foreground">exemplo</p></Card>)}
          </div>
          <Card className="p-4"><h2 className="font-black text-[#3D2C22]">Linha do tempo exemplo</h2><div className="mt-3 space-y-3">{demoTimeline.map((item) => <div key={item.time} className="flex gap-3"><span className="rounded-full bg-[#F5F0EC] px-3 py-1 text-xs font-bold text-[#8B7264]">{item.time}</span><div><p className="font-bold text-[#3D2C22]">{item.title}</p><p className="text-sm text-muted-foreground">{item.detail}</p></div></div>)}</div></Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container space-y-5 py-5 sm:py-6">
        <section className="glass-card bg-gradient-to-br from-[#FCEAE5] via-white to-[#EAF7EF] p-5 sm:p-7">
          <span className="medical-chip">Diário</span>
          <h1 className="mt-3 text-3xl font-black text-[#3D2C22]">Diário de {activeChild.name}</h1>
          <p className="mt-2 text-sm text-[#6F5B50]">Registre a rotina do dia e leve informações mais organizadas para a consulta.</p>
          <div className="mt-5 grid grid-cols-4 gap-2">
            <Card className="p-3 text-center"><p className="text-xl font-black text-[#3D2C22]">{todaySummary.feedings}</p><p className="text-[11px] text-muted-foreground">mamadas</p></Card>
            <Card className="p-3 text-center"><p className="text-xl font-black text-[#3D2C22]">{todaySummary.diapers}</p><p className="text-[11px] text-muted-foreground">fraldas</p></Card>
            <Card className="p-3 text-center"><p className="text-xl font-black text-[#3D2C22]">{todaySummary.naps}</p><p className="text-[11px] text-muted-foreground">cochilos</p></Card>
            <Card className="p-3 text-center"><p className="text-xl font-black text-[#3D2C22]">{todaySummary.symptoms}</p><p className="text-[11px] text-muted-foreground">sintomas</p></Card>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-3 rounded-[1.4rem] bg-white/80 p-1 shadow-sm sm:grid-cols-6">
            <TabsTrigger value="feeding" className="rounded-2xl py-3 text-xs"><Baby size={15} className="mr-1" />Mamada</TabsTrigger>
            <TabsTrigger value="diaper" className="rounded-2xl py-3 text-xs"><HeartPulse size={15} className="mr-1" />Fralda</TabsTrigger>
            <TabsTrigger value="sleep" className="rounded-2xl py-3 text-xs"><Moon size={15} className="mr-1" />Sono</TabsTrigger>
            <TabsTrigger value="symptoms" className="rounded-2xl py-3 text-xs"><AlertCircle size={15} className="mr-1" />Sintoma</TabsTrigger>
            <TabsTrigger value="digestive" className="rounded-2xl py-3 text-xs"><Utensils size={15} className="mr-1" />Gastro</TabsTrigger>
            <TabsTrigger value="notes" className="rounded-2xl py-3 text-xs"><FileText size={15} className="mr-1" />Notas</TabsTrigger>
          </TabsList>

          <TabsContent value="feeding" className="space-y-4 pt-4"><Card className="space-y-4 p-5"><div className="text-center"><p className="subtle-label">Cronômetro</p><div className="mt-2 rounded-[1.5rem] bg-white p-5 text-5xl font-black text-primary shadow-inner">{formatTimer(timerSeconds)}</div><div className="mt-3 flex justify-center gap-2"><Button onClick={() => setTimerRunning(!timerRunning)}>{timerRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}{timerRunning ? 'Pausar' : 'Iniciar'}</Button><Button variant="outline" onClick={() => { setTimerSeconds(0); setTimerRunning(false); }}><RotateCcw /></Button></div></div><div className="grid grid-cols-2 gap-2"><Button variant={feedingForm.leftBreast ? 'default' : 'outline'} onClick={() => setFeedingForm({ ...feedingForm, leftBreast: !feedingForm.leftBreast })}>Esquerdo</Button><Button variant={feedingForm.rightBreast ? 'default' : 'outline'} onClick={() => setFeedingForm({ ...feedingForm, rightBreast: !feedingForm.rightBreast })}>Direito</Button></div><textarea className="min-h-20 w-full rounded-2xl border border-border px-3 py-2 text-sm" placeholder="Observações sobre pega, dor ou satisfação..." value={feedingForm.notes} onChange={(e) => setFeedingForm({ ...feedingForm, notes: e.target.value })} /><Button className="w-full rounded-2xl py-6" onClick={saveFeeding}>Salvar mamada</Button></Card><LastList title="Últimas mamadas" items={feedingSessions.slice(0, 3).map((item) => ({ time: formatClock(item.startTime), title: `${Math.round(item.durationMinutes || 0)} min`, detail: item.notes || 'Sem observações' }))} /></TabsContent>

          <TabsContent value="diaper" className="space-y-4 pt-4"><Card className="space-y-4 p-5"><div className="grid grid-cols-3 gap-2"><Button variant={diaperForm.type === 'wet' ? 'default' : 'outline'} onClick={() => setDiaperForm({ ...diaperForm, type: 'wet' })}>Xixi</Button><Button variant={diaperForm.type === 'poop' ? 'default' : 'outline'} onClick={() => setDiaperForm({ ...diaperForm, type: 'poop' })}>Cocô</Button><Button variant={diaperForm.type === 'both' ? 'default' : 'outline'} onClick={() => setDiaperForm({ ...diaperForm, type: 'both' })}>Ambos</Button></div><Input placeholder="Observações da fralda..." value={diaperForm.notes} onChange={(e) => setDiaperForm({ ...diaperForm, notes: e.target.value })} /><Button className="w-full rounded-2xl py-6" onClick={saveDiaper}>Salvar fralda</Button></Card><LastList title="Últimas fraldas" items={diaperEntries.slice(0, 3).map((item) => ({ time: formatClock(item.time), title: item.type === 'wet' ? 'Xixi' : item.type === 'poop' ? 'Cocô' : 'Xixi e cocô', detail: item.notes || 'Sem observações' }))} /></TabsContent>

          <TabsContent value="sleep" className="space-y-4 pt-4"><Card className="space-y-4 p-5"><div className="grid grid-cols-2 gap-3"><label className="text-sm font-bold">Cochilos<Input type="number" value={sleepForm.naps} onChange={(e) => setSleepForm({ ...sleepForm, naps: Number(e.target.value) })} /></label><label className="text-sm font-bold">Despertares<Input type="number" value={sleepForm.awakenings} onChange={(e) => setSleepForm({ ...sleepForm, awakenings: Number(e.target.value) })} /></label></div><Input placeholder="Observações do sono..." value={sleepForm.notes} onChange={(e) => setSleepForm({ ...sleepForm, notes: e.target.value })} /><Button className="w-full rounded-2xl py-6" onClick={saveSleep}>Salvar sono</Button></Card><LastList title="Últimos sonos" items={sleepEntries.slice(0, 3).map((item) => ({ time: formatClock(item.endTime), title: `${item.naps} cochilo(s)`, detail: item.notes || `${item.awakenings} despertar(es)` }))} /></TabsContent>

          <TabsContent value="symptoms" className="space-y-4 pt-4"><Card className="space-y-4 p-5"><select className="w-full rounded-2xl border border-border bg-white px-3 py-3 text-sm" value={symptomForm.symptomType} onChange={(e) => setSymptomForm({ ...symptomForm, symptomType: e.target.value })}><option value="fever">Febre</option><option value="vomit">Vômito</option><option value="diarrhea">Diarreia</option><option value="reflux">Refluxo</option><option value="constipation">Constipação</option><option value="other">Outro</option></select><div className="grid grid-cols-3 gap-2"><Button variant={symptomForm.intensity === 'mild' ? 'default' : 'outline'} onClick={() => setSymptomForm({ ...symptomForm, intensity: 'mild' })}>Leve</Button><Button variant={symptomForm.intensity === 'moderate' ? 'default' : 'outline'} onClick={() => setSymptomForm({ ...symptomForm, intensity: 'moderate' })}>Moderado</Button><Button variant={symptomForm.intensity === 'severe' ? 'default' : 'outline'} onClick={() => setSymptomForm({ ...symptomForm, intensity: 'severe' })}>Grave</Button></div><Input placeholder="Observações e contexto..." value={symptomForm.notes} onChange={(e) => setSymptomForm({ ...symptomForm, notes: e.target.value })} /><Button className="w-full rounded-2xl py-6" onClick={saveSymptom}>Salvar sintoma</Button></Card><Card className="border-amber-200 bg-[#FFF8EA] p-4 text-sm text-[#8B5D1E]">Sangue nas fezes, vômitos persistentes, sinais de desidratação, febre persistente ou piora do estado geral exigem avaliação médica.</Card></TabsContent>

          <TabsContent value="digestive" className="space-y-4 pt-4"><Card className="p-5"><Utensils className="mb-3 text-secondary" /><h2 className="font-black text-[#3D2C22]">Saúde digestiva</h2><p className="mt-1 text-sm text-muted-foreground">Use sintomas e notas para organizar evacuações, refluxo, dor abdominal, seletividade alimentar e alimentos associados.</p><Button className="mt-4 w-full rounded-2xl" onClick={() => setActiveTab('symptoms')}>Registrar sintoma gastro</Button></Card></TabsContent>

          <TabsContent value="notes" className="space-y-4 pt-4"><Card className="space-y-4 p-5"><textarea className="min-h-28 w-full rounded-2xl border border-border px-3 py-2 text-sm" placeholder="Dúvidas, comportamento, alimentação ou algo para lembrar na consulta..." value={noteText} onChange={(e) => setNoteText(e.target.value)} /><Button className="w-full rounded-2xl py-6" onClick={saveNote}>Salvar observação</Button></Card><LastList title="Últimas observações" items={notes.slice(0, 3).map((item) => ({ time: formatClock(item.date), title: 'Observação', detail: item.content }))} /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function LastList({ title, items }: { title: string; items: { time: string; title: string; detail: string }[] }) {
  return <Card className="p-4"><h3 className="font-black text-[#3D2C22]">{title}</h3>{items.length ? <div className="mt-3 space-y-3">{items.map((item, index) => <div key={`${item.time}-${index}`} className="flex gap-3"><span className="h-fit rounded-full bg-[#F5F0EC] px-3 py-1 text-xs font-bold text-[#8B7264]">{item.time}</span><div><p className="font-bold text-[#3D2C22]">{item.title}</p><p className="text-sm text-muted-foreground">{item.detail}</p></div></div>)}</div> : <p className="mt-2 text-sm text-muted-foreground">Nenhum registro ainda.</p>}</Card>;
}
