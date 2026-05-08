import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Clock, Droplets, Moon, AlertCircle, Utensils, FileText, Activity, Play, Pause, RotateCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useActiveChild } from '@/contexts/ActiveChildContext';
import { useNotification } from '@/contexts/NotificationContext';
import * as storage from '@/lib/storage';
import type { FeedingSession, DiaperEntry, SleepEntry, SymptomEntry, GeneralNote } from '@shared/types';

export default function Diary() {
  const { activeChild } = useActiveChild();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('feeding');
  
  // Aleitamento
  const [feedingSessions, setFeedingSessions] = useState<FeedingSession[]>([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [feedingForm, setFeedingForm] = useState({
    rightBreast: false,
    leftBreast: false,
    pegQuality: 'good' as 'good' | 'difficult' | 'painful' | 'unknown',
    maternalPain: false,
    babyContent: 'yes' as 'yes' | 'no' | 'unknown',
    notes: '',
  });

  // Fraldas
  const [diaperEntries, setDiaperEntries] = useState<DiaperEntry[]>([]);
  const [diaperForm, setDiaperForm] = useState({
    type: 'wet' as 'wet' | 'poop' | 'both',
    stoolAppearance: ['yellow'] as any[],
    notes: '',
  });

  // Sono
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [sleepForm, setSleepForm] = useState({
    startTime: Date.now(),
    endTime: Date.now(),
    awakenings: 0,
    naps: 0,
    notes: '',
  });

  // Sintomas
  const [symptomEntries, setSymptomEntries] = useState<SymptomEntry[]>([]);
  const [symptomForm, setSymptomForm] = useState({
    type: 'fever' as any,
    severity: 'mild' as 'mild' | 'moderate' | 'severe',
    notes: '',
  });

  // Observações
  const [notes, setNotes] = useState<GeneralNote[]>([]);
  const [noteText, setNoteText] = useState('');

  // Carregar dados ao montar
  useEffect(() => {
    if (!activeChild) return;
    loadData();
  }, [activeChild]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
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

  const handleSaveFeeding = async () => {
    if (!activeChild || (!feedingForm.rightBreast && !feedingForm.leftBreast)) {
      alert('Selecione pelo menos um seio');
      return;
    }

    const session: FeedingSession = {
      id: `feeding-${Date.now()}`,
      childId: activeChild.id,
      date: new Date().setHours(0, 0, 0, 0),
      startTime: Date.now() - (timerSeconds * 1000),
      endTime: Date.now(),
      durationMinutes: timerSeconds / 60,
      rightBreast: feedingForm.rightBreast,
      leftBreast: feedingForm.leftBreast,
      pegQuality: feedingForm.pegQuality,
      maternalPain: feedingForm.maternalPain,
      babyContent: feedingForm.babyContent,
      notes: feedingForm.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.addFeedingSession(session);
    await loadData();
    setTimerSeconds(0);
    setTimerRunning(false);
    setFeedingForm({
      rightBreast: false,
      leftBreast: false,
      pegQuality: 'good',
      maternalPain: false,
      babyContent: 'yes',
      notes: '',
    });
    
    addNotification({
      type: 'success',
      title: '✓ Mamada registrada',
      message: `Duração: ${Math.round(timerSeconds / 60)} minutos`,
      duration: 4000,
    });
  };

  const handleSaveDiaper = async () => {
    if (!activeChild) return;

    const entry: DiaperEntry = {
      id: `diaper-${Date.now()}`,
      childId: activeChild.id,
      date: new Date().setHours(0, 0, 0, 0),
      time: Date.now(),
      type: diaperForm.type,
      stoolAppearance: diaperForm.stoolAppearance,
      notes: diaperForm.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.addDiaperEntry(entry);
    await loadData();
    setDiaperForm({ type: 'wet', stoolAppearance: ['yellow'], notes: '' });
    
    const typeLabel = diaperForm.type === 'wet' ? 'Xixi' : diaperForm.type === 'poop' ? 'Cocô' : 'Xixi e Cocô';
    addNotification({
      type: 'success',
      title: '✓ Fralda registrada',
      message: `${typeLabel} registrado com sucesso`,
      duration: 4000,
    });
  };

  const handleSaveSleep = async () => {
    if (!activeChild) {
      alert('Selecione uma criança');
      return;
    }

    const entry: SleepEntry = {
      id: `sleep-${Date.now()}`,
      childId: activeChild.id,
      date: new Date().setHours(0, 0, 0, 0),
      startTime: sleepForm.startTime,
      endTime: sleepForm.endTime,
      awakenings: sleepForm.awakenings,
      naps: sleepForm.naps,
      notes: sleepForm.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.addSleepEntry(entry);
    await loadData();
    setSleepForm({ startTime: Date.now(), endTime: Date.now(), awakenings: 0, naps: 0, notes: '' });
    
    const sleepDurationMinutes = (sleepForm.endTime - sleepForm.startTime) / 60000;
    addNotification({
      type: 'success',
      title: '✓ Sono registrado',
      message: `${Math.round(sleepDurationMinutes)} minutos de sono registrados`,
      duration: 4000,
    });
  };

  const handleSaveSymptom = async () => {
    if (!activeChild) return;

    const entry: SymptomEntry = {
      id: `symptom-${Date.now()}`,
      childId: activeChild.id,
      date: new Date().setHours(0, 0, 0, 0),
      startTime: Date.now(),
      symptomType: symptomForm.type as any,
      intensity: symptomForm.severity,
      notes: symptomForm.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.addSymptomEntry(entry);
    await loadData();
    setSymptomForm({ type: 'fever', severity: 'mild', notes: '' });
    
    const severityLabel = symptomForm.severity === 'mild' ? 'leve' : symptomForm.severity === 'moderate' ? 'moderada' : 'grave';
    addNotification({
      type: symptomForm.severity === 'severe' ? 'warning' : 'info',
      title: '✓ Sintoma registrado',
      message: `Sintoma ${severityLabel} registrado. Monitore o bebê.`,
      duration: 5000,
    });
  };

  const handleSaveNote = async () => {
    if (!activeChild || !noteText.trim()) {
      alert('Escreva uma observação');
      return;
    }

    const note: GeneralNote = {
      id: `note-${Date.now()}`,
      childId: activeChild.id,
      date: new Date().setHours(0, 0, 0, 0),
      content: noteText,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.addGeneralNote(note);
    await loadData();
    setNoteText('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (!activeChild) {
    return (
      <AppLayout>
        <div className="container py-8">
          <Card className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Selecione uma criança para registrar atividades</p>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Diário de {activeChild.name}</h1>
          <p className="text-muted-foreground">Registre as atividades diárias da criança</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="feeding" className="text-xs">
              <Droplets size={16} className="mr-1" />
              <span className="hidden sm:inline">Mamada</span>
            </TabsTrigger>
            <TabsTrigger value="diaper" className="text-xs">
              <Activity size={16} className="mr-1" />
              <span className="hidden sm:inline">Fralda</span>
            </TabsTrigger>
            <TabsTrigger value="sleep" className="text-xs">
              <Moon size={16} className="mr-1" />
              <span className="hidden sm:inline">Sono</span>
            </TabsTrigger>
            <TabsTrigger value="symptoms" className="text-xs">
              <AlertCircle size={16} className="mr-1" />
              <span className="hidden sm:inline">Sintoma</span>
            </TabsTrigger>
            <TabsTrigger value="digestive" className="text-xs">
              <Utensils size={16} className="mr-1" />
              <span className="hidden sm:inline">Gastro</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">
              <FileText size={16} className="mr-1" />
              <span className="hidden sm:inline">Notas</span>
            </TabsTrigger>
          </TabsList>

          {/* Aleitamento */}
          <TabsContent value="feeding" className="space-y-4">
            <Card className="p-6 bg-primary/5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock size={20} className="text-primary" />
                Cronômetro de Mamada
              </h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-mono font-bold text-primary mb-4 p-4 bg-white rounded-lg">{formatTime(timerSeconds)}</div>
                <div className="flex gap-2 justify-center">
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => setTimerRunning(!timerRunning)}
                  >
                    {timerRunning ? <Pause size={20} className="mr-2" /> : <Play size={20} className="mr-2" />}
                    {timerRunning ? 'Pausar' : 'Iniciar'}
                  </Button>
                  <Button variant="outline" onClick={() => { setTimerSeconds(0); setTimerRunning(false); }}>
                    <RotateCcw size={20} />
                  </Button>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={feedingForm.rightBreast} onChange={(e) => setFeedingForm({ ...feedingForm, rightBreast: e.target.checked })} />
                  <span>Seio direito</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={feedingForm.leftBreast} onChange={(e) => setFeedingForm({ ...feedingForm, leftBreast: e.target.checked })} />
                  <span>Seio esquerdo</span>
                </label>
              </div>
              <select className="w-full px-3 py-2 border rounded-md mb-3" value={feedingForm.pegQuality} onChange={(e) => setFeedingForm({ ...feedingForm, pegQuality: e.target.value as any })}>
                <option value="good">Pega boa</option>
                <option value="difficult">Pega difícil</option>
                <option value="painful">Pega dolorosa</option>
                <option value="unknown">Não sei</option>
              </select>
              <label className="flex items-center gap-2 mb-3">
                <input type="checkbox" checked={feedingForm.maternalPain} onChange={(e) => setFeedingForm({ ...feedingForm, maternalPain: e.target.checked })} />
                <span>Dor materna</span>
              </label>
              <textarea className="w-full px-3 py-2 border rounded-md mb-4" placeholder="Observações..." value={feedingForm.notes} onChange={(e) => setFeedingForm({ ...feedingForm, notes: e.target.value })} rows={2} />
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSaveFeeding}>
                <Plus size={20} className="mr-2" />
                Salvar Mamada
              </Button>
            </Card>

            {feedingSessions.length > 0 && (
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Registros de Hoje</h4>
                {feedingSessions.slice(-3).map((session) => (
                  <div key={session.id} className="flex justify-between items-center p-2 bg-muted rounded mb-2">
                    <span className="text-sm">{formatDate(session.startTime)} - {Math.round(session.durationMinutes || 0)} min</span>
                  </div>
                ))}
              </Card>
            )}
          </TabsContent>

          {/* Fraldas */}
          <TabsContent value="diaper" className="space-y-4">
            <Card className="p-4 space-y-4">
              <select className="w-full px-3 py-2 border rounded-md" value={diaperForm.type} onChange={(e) => setDiaperForm({ ...diaperForm, type: e.target.value as any })}>
                <option value="wet">Xixi</option>
                <option value="poop">Cocô</option>
                <option value="both">Xixi e Cocô</option>
              </select>
              <select className="w-full px-3 py-2 border rounded-md" value={diaperForm.stoolAppearance?.[0] || 'yellow'} onChange={(e) => setDiaperForm({ ...diaperForm, stoolAppearance: [e.target.value as any] })}>
                <option value="yellow">Amarelo</option>
                <option value="greenish">Esverdeado</option>
                <option value="brown">Marrom</option>
                <option value="hard">Duro</option>
                <option value="liquid">Líquido</option>
                <option value="mucus">Com muco</option>
                <option value="blood">Com sangue</option>
              </select>
              <textarea className="w-full px-3 py-2 border rounded-md" placeholder="Observações..." value={diaperForm.notes} onChange={(e) => setDiaperForm({ ...diaperForm, notes: e.target.value })} rows={3} />
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSaveDiaper}>
                <Plus size={20} className="mr-2" />
                Registrar Fralda
              </Button>
            </Card>
          </TabsContent>

          {/* Sono */}
          <TabsContent value="sleep" className="space-y-4">
            <Card className="p-4 space-y-4">
              <div>
                <label className="text-sm font-semibold">Início do sono</label>
                <Input type="datetime-local" value={new Date(sleepForm.startTime).toISOString().slice(0, 16)} onChange={(e) => setSleepForm({ ...sleepForm, startTime: new Date(e.target.value).getTime() })} />
              </div>
              <div>
                <label className="text-sm font-semibold">Fim do sono</label>
                <Input type="datetime-local" value={new Date(sleepForm.endTime).toISOString().slice(0, 16)} onChange={(e) => setSleepForm({ ...sleepForm, endTime: new Date(e.target.value).getTime() })} />
              </div>
              <div>
                <label className="text-sm font-semibold">Despertares</label>
                <Input type="number" value={sleepForm.awakenings} onChange={(e) => setSleepForm({ ...sleepForm, awakenings: parseInt(e.target.value) || 0 })} min="0" />
              </div>
              <div>
                <label className="text-sm font-semibold">Cochilos</label>
                <Input type="number" value={sleepForm.naps} onChange={(e) => setSleepForm({ ...sleepForm, naps: parseInt(e.target.value) || 0 })} min="0" />
              </div>
              <textarea className="w-full px-3 py-2 border rounded-md" placeholder="Observações..." value={sleepForm.notes} onChange={(e) => setSleepForm({ ...sleepForm, notes: e.target.value })} rows={3} />
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSaveSleep}>
                <Plus size={20} className="mr-2" />
                Registrar Sono
              </Button>
            </Card>
          </TabsContent>

          {/* Sintomas */}
          <TabsContent value="symptoms" className="space-y-4">
            <Card className="p-4 space-y-4">
              <select className="w-full px-3 py-2 border rounded-md" value={symptomForm.type} onChange={(e) => setSymptomForm({ ...symptomForm, type: e.target.value })}>
                <option value="fever">Febre</option>
                <option value="cough">Tosse</option>
                <option value="diarrhea">Diarreia</option>
                <option value="vomiting">Vômito</option>
                <option value="rash">Erupção</option>
                <option value="other">Outro</option>
              </select>
              <select className="w-full px-3 py-2 border rounded-md" value={symptomForm.severity} onChange={(e) => setSymptomForm({ ...symptomForm, severity: e.target.value as any })}>
                <option value="mild">Leve</option>
                <option value="moderate">Moderado</option>
                <option value="severe">Grave</option>
              </select>
              <textarea className="w-full px-3 py-2 border rounded-md" placeholder="Descreva o sintoma..." value={symptomForm.notes} onChange={(e) => setSymptomForm({ ...symptomForm, notes: e.target.value })} rows={3} />
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSaveSymptom}>
                <Plus size={20} className="mr-2" />
                Registrar Sintoma
              </Button>
            </Card>
          </TabsContent>

          {/* Saúde Digestiva */}
          <TabsContent value="digestive" className="space-y-4">
            <Card className="p-4 bg-secondary/5">
              <h3 className="font-semibold mb-4">Saúde Digestiva</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use esta área para acompanhar a saúde digestiva e preparar a consulta.
              </p>
              <Button className="w-full bg-secondary hover:bg-secondary/90">
                Preparar Consulta de Saúde Digestiva
              </Button>
            </Card>
          </TabsContent>

          {/* Observações */}
          <TabsContent value="notes" className="space-y-4">
            <Card className="p-4 space-y-4">
              <textarea placeholder="Escreva uma observação..." className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4} />
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSaveNote}>
                <Plus size={20} className="mr-2" />
                Salvar Observação
              </Button>
              {notes.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Observações Recentes</h4>
                  {notes.slice(-5).map((note) => (
                    <Card key={note.id} className="p-3 mb-2">
                      <p className="text-xs text-muted-foreground mb-1">{formatDate(note.date)}</p>
                      <p className="text-sm">{note.content}</p>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
