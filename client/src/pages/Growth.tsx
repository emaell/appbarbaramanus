import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useActiveChild } from '@/contexts/ActiveChildContext';
import { useNotification } from '@/contexts/NotificationContext';
import { AlertCircle, Baby, Download, Info, Plus, Ruler, Sparkles, TrendingUp } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import * as storage from '@/lib/storage';
import type { GrowthRecord } from '@shared/types';

const demoRecords = [
  { date: 'Jan', weight: 4.2, length: 54, headCircumference: 37 },
  { date: 'Fev', weight: 5.1, length: 57, headCircumference: 38.5 },
  { date: 'Mar', weight: 5.9, length: 61, headCircumference: 40 },
  { date: 'Abr', weight: 6.6, length: 64, headCircumference: 41.2 },
];

const metricOptions = [
  { key: 'weight', label: 'Peso', suffix: 'kg' },
  { key: 'length', label: 'Comprimento', suffix: 'cm' },
  { key: 'height', label: 'Altura', suffix: 'cm' },
  { key: 'headCircumference', label: 'Perímetro', suffix: 'cm' },
] as const;

type Metric = (typeof metricOptions)[number]['key'];

function chipClass(active: boolean) {
  return active ? 'bg-[#FCEAE5] text-[#C96B56] shadow-sm' : 'bg-[#F5F0EC] text-[#8B7264]';
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(timestamp));
}

export default function Growth() {
  const { activeChild } = useActiveChild();
  const { addNotification } = useNotification();
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<Metric>('weight');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    length: '',
    height: '',
    headCircumference: '',
    position: 'lying' as 'lying' | 'standing',
    location: 'home' as 'home' | 'consultation' | 'vaccine' | 'other',
    notes: '',
  });

  useEffect(() => {
    if (!activeChild) return;
    loadRecords();
  }, [activeChild]);

  const loadRecords = async () => {
    if (!activeChild) return;
    const data = await storage.getGrowthRecordsForChild(activeChild.id);
    setRecords(data.sort((a, b) => a.date - b.date));
  };

  const handleSaveRecord = async () => {
    if (!activeChild) return;
    if (!formData.weight && !formData.length && !formData.height && !formData.headCircumference) {
      alert('Preencha pelo menos uma medida.');
      return;
    }

    const record: GrowthRecord = {
      id: `growth-${Date.now()}`,
      childId: activeChild.id,
      date: new Date().setHours(0, 0, 0, 0),
      weight: formData.weight ? Number(formData.weight) : undefined,
      length: formData.length ? Number(formData.length) : undefined,
      height: formData.height ? Number(formData.height) : undefined,
      headCircumference: formData.headCircumference ? Number(formData.headCircumference) : undefined,
      position: formData.position,
      location: formData.location,
      notes: formData.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.addGrowthRecord(record);
    await loadRecords();
    setShowForm(false);
    setFormData({ weight: '', length: '', height: '', headCircumference: '', position: 'lying', location: 'home', notes: '' });
    addNotification({ type: 'success', title: '✓ Medida registrada', message: 'Registro salvo neste dispositivo.', duration: 3500 });
  };

  const handleExport = () => {
    if (!activeChild || records.length === 0) return;
    const text = [`Resumo de crescimento — ${activeChild.name}`, ...records.map((r) => `${new Date(r.date).toLocaleDateString('pt-BR')}: peso ${r.weight ?? '-'} kg · comprimento ${r.length ?? r.height ?? '-'} cm · PC ${r.headCircumference ?? '-'} cm`)].join('\n');
    navigator.clipboard?.writeText(text);
    addNotification({ type: 'success', title: 'Resumo copiado', message: 'Cole no WhatsApp ou leve para a consulta.', duration: 3500 });
  };

  const currentOption = metricOptions.find((item) => item.key === selectedMetric)!;
  const chartData = useMemo(() => {
    if (!records.length) return demoRecords.map((item) => ({ date: item.date, value: item[selectedMetric as keyof typeof item] as number }));
    return records
      .filter((record) => record[selectedMetric])
      .map((record) => ({ date: formatDate(record.date), value: record[selectedMetric] as number }));
  }, [records, selectedMetric]);

  const latest = records[records.length - 1];

  return (
    <AppLayout>
      <div className="container space-y-5 py-5 sm:py-6">
        <section className="glass-card overflow-hidden">
          <div className="bg-gradient-to-br from-[#EAF5FF] via-white to-[#F7FCFE] p-5 sm:p-7">
            <span className="medical-chip">Crescimento</span>
            <h1 className="mt-4 text-3xl font-black leading-tight text-[#3D2C22]">Acompanhe a evolução do bebê</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6F5B50]">
              Registre peso, comprimento/altura e perímetro cefálico para levar dados mais claros à consulta pediátrica.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <Card className="p-3"><p className="text-[11px] font-bold uppercase text-muted-foreground">Peso</p><p className="mt-1 text-lg font-black text-[#3D2C22]">{latest?.weight ? `${latest.weight} kg` : '5,9 kg'}</p><p className="text-[11px] text-muted-foreground">{latest ? 'último' : 'exemplo'}</p></Card>
              <Card className="p-3"><p className="text-[11px] font-bold uppercase text-muted-foreground">Altura</p><p className="mt-1 text-lg font-black text-[#3D2C22]">{latest?.length || latest?.height ? `${latest.length ?? latest.height} cm` : '61 cm'}</p><p className="text-[11px] text-muted-foreground">{latest ? 'último' : 'exemplo'}</p></Card>
              <Card className="p-3"><p className="text-[11px] font-bold uppercase text-muted-foreground">PC</p><p className="mt-1 text-lg font-black text-[#3D2C22]">{latest?.headCircumference ? `${latest.headCircumference} cm` : '40 cm'}</p><p className="text-[11px] text-muted-foreground">{latest ? 'último' : 'exemplo'}</p></Card>
            </div>
          </div>
        </section>

        {!activeChild && (
          <Card className="border-amber-200 bg-[#FFF8EA] p-4">
            <div className="flex gap-3">
              <AlertCircle className="mt-1 shrink-0 text-amber-700" />
              <div>
                <h2 className="font-black text-[#3D2C22]">Exemplo demonstrativo</h2>
                <p className="mt-1 text-sm text-[#8B7264]">Cadastre uma criança no Perfil para salvar medidas reais neste dispositivo.</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button className="rounded-2xl py-6 font-extrabold" onClick={() => activeChild ? setShowForm(!showForm) : alert('Cadastre uma criança no Perfil para adicionar medidas.')}>
            <Plus size={18} className="mr-2" />Adicionar medida
          </Button>
          <Button variant="outline" className="rounded-2xl py-6" disabled={!activeChild || records.length === 0} onClick={handleExport}>
            <Download size={18} className="mr-2" />Copiar resumo
          </Button>
        </div>

        {showForm && activeChild && (
          <Card className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm font-bold">Peso (kg)<Input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="5.9" /></label>
              <label className="space-y-1 text-sm font-bold">Comprimento (cm)<Input type="number" step="0.1" value={formData.length} onChange={(e) => setFormData({ ...formData, length: e.target.value })} placeholder="61" /></label>
              <label className="space-y-1 text-sm font-bold">Altura (cm)<Input type="number" step="0.1" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} placeholder="75" /></label>
              <label className="space-y-1 text-sm font-bold">Perímetro (cm)<Input type="number" step="0.1" value={formData.headCircumference} onChange={(e) => setFormData({ ...formData, headCircumference: e.target.value })} placeholder="40" /></label>
            </div>
            <textarea className="min-h-20 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm" placeholder="Observações para a consulta..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
            <Button className="w-full rounded-2xl py-6" onClick={handleSaveRecord}>Salvar medida</Button>
          </Card>
        )}

        <section className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {metricOptions.map((metric) => (
              <button key={metric.key} onClick={() => setSelectedMetric(metric.key)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${chipClass(selectedMetric === metric.key)}`}>
                {metric.label}
              </button>
            ))}
          </div>
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between"><div><p className="subtle-label">Evolução</p><h2 className="font-black text-[#3D2C22]">{currentOption.label}</h2></div><TrendingUp className="text-accent" /></div>
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)} ${currentOption.suffix}`, currentOption.label]} />
                <Line type="monotone" dataKey="value" stroke="#A8D4E6" strokeWidth={3} dot={{ fill: '#F0A48F', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
            {!records.length && <p className="mt-2 text-center text-xs text-muted-foreground">Gráfico demonstrativo. Os dados reais aparecerão após o cadastro das medidas.</p>}
          </Card>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <Card className="p-4"><Baby className="mb-2 text-primary" /><h3 className="font-black text-[#3D2C22]">Como usar</h3><p className="mt-1 text-sm text-muted-foreground">Registre medidas após consultas ou pesagens confiáveis para comparar a evolução.</p></Card>
          <Card className="p-4"><Info className="mb-2 text-accent" /><h3 className="font-black text-[#3D2C22]">Atenção</h3><p className="mt-1 text-sm text-muted-foreground">O app mostra tendência individual. Percentis e interpretação devem ser feitos pela pediatra.</p></Card>
          <Card className="p-4"><Sparkles className="mb-2 text-secondary" /><h3 className="font-black text-[#3D2C22]">Leve à consulta</h3><p className="mt-1 text-sm text-muted-foreground">Use o resumo para contar melhor a história de crescimento da criança.</p></Card>
        </section>

        {records.length > 0 && (
          <section className="space-y-3">
            <h2 className="section-title">Últimos registros</h2>
            {records.slice(-5).reverse().map((record) => (
              <Card key={record.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-[#3D2C22]">{new Date(record.date).toLocaleDateString('pt-BR')}</p><p className="mt-1 text-sm text-muted-foreground">Peso {record.weight ?? '-'} kg · Comprimento {record.length ?? record.height ?? '-'} cm · PC {record.headCircumference ?? '-'} cm</p>{record.notes && <p className="mt-2 text-xs italic text-muted-foreground">{record.notes}</p>}</div><Ruler className="shrink-0 text-accent" /></div></Card>
            ))}
          </section>
        )}
      </div>
    </AppLayout>
  );
}
