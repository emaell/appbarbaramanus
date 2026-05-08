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
import {
  Z_SCORE_LINES,
  calculateAgeInMonths,
  calculateBMI,
  getCautiousClassification,
  getGrowthCurveDefinition,
  getGrowthMetricUnit,
  getMeasuredValue,
  getStature,
  getZScoreDataKey,
  type GrowthMetric,
} from '@/lib/growthCurves';

const metricOptions: { key: GrowthMetric; label: string; help: string }[] = [
  { key: 'weight', label: 'Peso', help: 'Peso para idade' },
  { key: 'stature', label: 'Estatura', help: 'Comprimento/estatura para idade' },
  { key: 'bmi', label: 'IMC', help: 'IMC para idade' },
  { key: 'headCircumference', label: 'Perímetro cefálico', help: 'Principalmente de 0 a 2 anos' },
];

function chipClass(active: boolean) {
  return active ? 'bg-[#FCEAE5] text-[#C96B56] shadow-sm' : 'bg-[#F5F0EC] text-[#8B7264]';
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(timestamp));
}

function inputClass() {
  return 'h-12 rounded-2xl border-[#E9D8CF] bg-white text-[#3D2C22] placeholder:text-[#B8A79E] focus-visible:ring-primary/40';
}

function parseDecimal(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toISODate(timestamp: number) {
  return new Date(timestamp).toISOString().split('T')[0];
}

export default function Growth() {
  const { activeChild } = useActiveChild();
  const { addNotification } = useNotification();
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<GrowthMetric>('weight');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    measurementDate: '',
    weight: '',
    stature: '',
    headCircumference: '',
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

  const activeAgeMonths = activeChild ? calculateAgeInMonths(activeChild.dateOfBirth, Date.now()) : 0;
  const curveDefinition = activeChild ? getGrowthCurveDefinition(activeChild.sex, selectedMetric, activeAgeMonths) : undefined;
  const currentMetric = metricOptions.find((item) => item.key === selectedMetric)!;
  const currentUnit = getGrowthMetricUnit(selectedMetric);

  const handleSaveRecord = async () => {
    if (!activeChild) return;
    if (!formData.measurementDate) {
      alert('Informe a data da medição.');
      return;
    }

    const measurementDate = new Date(`${formData.measurementDate}T12:00:00`).getTime();
    const ageAtMeasurement = calculateAgeInMonths(activeChild.dateOfBirth, measurementDate);
    const weight = parseDecimal(formData.weight);
    const stature = parseDecimal(formData.stature);
    const headCircumference = parseDecimal(formData.headCircumference);

    if (!weight && !stature && !headCircumference) {
      alert('Preencha pelo menos uma medida.');
      return;
    }

    const record: GrowthRecord = {
      id: `growth-${Date.now()}`,
      childId: activeChild.id,
      date: measurementDate,
      weight,
      length: ageAtMeasurement <= 24 ? stature : undefined,
      height: ageAtMeasurement > 24 ? stature : undefined,
      headCircumference,
      position: ageAtMeasurement <= 24 ? 'lying' : 'standing',
      location: formData.location,
      notes: formData.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.addGrowthRecord(record);
    await loadRecords();
    setShowForm(false);
    setFormData({ measurementDate: '', weight: '', stature: '', headCircumference: '', location: 'home', notes: '' });
    addNotification({ type: 'success', title: '✓ Medida registrada', message: 'Registro salvo neste dispositivo.', duration: 3500 });
  };

  const handleExport = () => {
    if (!activeChild || records.length === 0) return;
    const text = [
      `Resumo de crescimento — ${activeChild.name}`,
      `Sexo: ${activeChild.sex === 'female' ? 'menina' : 'menino'}`,
      ...records.map((r) => {
        const stature = getStature(r);
        const bmi = calculateBMI(r.weight, stature);
        return `${new Date(r.date).toLocaleDateString('pt-BR')}: peso ${r.weight ?? '-'} kg · estatura ${stature ?? '-'} cm · IMC ${bmi ?? '-'} · perímetro cefálico ${r.headCircumference ?? '-'} cm`;
      }),
    ].join('\n');
    navigator.clipboard?.writeText(text);
    addNotification({ type: 'success', title: 'Resumo copiado', message: 'Cole no WhatsApp ou leve para a consulta.', duration: 3500 });
  };

  const chartData = useMemo(() => {
    if (!activeChild) return [];

    const officialRows = curveDefinition?.points.map((point) => ({
      ageMonths: point.ageMonths,
      label: `${point.ageMonths}m`,
      zMinus3: point.zMinus3,
      zMinus2: point.zMinus2,
      zMinus1: point.zMinus1,
      z0: point.z0,
      zPlus1: point.zPlus1,
      zPlus2: point.zPlus2,
      zPlus3: point.zPlus3,
    })) ?? [];

    const userRows = records
      .map((record) => {
        const value = getMeasuredValue(record, selectedMetric);
        if (!value) return null;
        const ageMonths = calculateAgeInMonths(activeChild.dateOfBirth, record.date);
        return {
          ageMonths,
          label: `${ageMonths}m`,
          userValue: value,
          userDate: formatDate(record.date),
          userAge: `${ageMonths} meses`,
          classification: curveDefinition?.hasOfficialDataset ? 'Acompanhe com o pediatra para interpretação adequada.' : getCautiousClassification(),
        };
      })
      .filter(Boolean) as any[];

    if (!officialRows.length) return userRows;

    const byAge = new Map<number, any>();
    officialRows.forEach((row) => byAge.set(row.ageMonths, row));
    userRows.forEach((row) => byAge.set(row.ageMonths, { ...(byAge.get(row.ageMonths) ?? { ageMonths: row.ageMonths, label: `${row.ageMonths}m` }), ...row }));
    return Array.from(byAge.values()).sort((a, b) => a.ageMonths - b.ageMonths);
  }, [activeChild, curveDefinition, records, selectedMetric]);

  const latest = records[records.length - 1];
  const latestStature = latest ? getStature(latest) : undefined;
  const latestBmi = latest ? calculateBMI(latest.weight, latestStature) : undefined;

  return (
    <AppLayout>
      <div className="container space-y-5 py-5 sm:py-6">
        <section className="glass-card overflow-hidden">
          <div className="bg-gradient-to-br from-[#EAF5FF] via-white to-[#F7FCFE] p-5 sm:p-7">
            <span className="medical-chip">Crescimento</span>
            <h1 className="mt-4 text-3xl font-black leading-tight text-[#3D2C22]">Acompanhe a evolução da criança</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6F5B50]">
              Os gráficos seguem a estrutura da Caderneta da Criança: sexo, idade, peso, estatura, IMC e perímetro cefálico.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <Card className="p-3"><p className="text-[11px] font-bold uppercase text-muted-foreground">Peso</p><p className="mt-1 text-lg font-black text-[#3D2C22]">{latest?.weight ? `${latest.weight} kg` : '-'}</p><p className="text-[11px] text-muted-foreground">{latest ? 'último' : 'sem dado'}</p></Card>
              <Card className="p-3"><p className="text-[11px] font-bold uppercase text-muted-foreground">Estatura</p><p className="mt-1 text-lg font-black text-[#3D2C22]">{latestStature ? `${latestStature} cm` : '-'}</p><p className="text-[11px] text-muted-foreground">{activeAgeMonths <= 24 ? 'comprimento' : 'altura'}</p></Card>
              <Card className="p-3"><p className="text-[11px] font-bold uppercase text-muted-foreground">Perímetro cefálico</p><p className="mt-1 text-lg font-black text-[#3D2C22]">{latest?.headCircumference ? `${latest.headCircumference} cm` : '-'}</p><p className="text-[11px] text-muted-foreground">0 a 2 anos</p></Card>
            </div>
          </div>
        </section>

        {!activeChild && (
          <Card className="border-amber-200 bg-[#FFF8EA] p-4">
            <div className="flex gap-3"><AlertCircle className="mt-1 shrink-0 text-amber-700" /><div><h2 className="font-black text-[#3D2C22]">Cadastre uma criança</h2><p className="mt-1 text-sm text-[#8B7264]">A data de nascimento e o sexo são necessários para selecionar a curva correta.</p></div></div>
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
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-bold text-[#3D2C22]">Data da medição<Input className={inputClass()} type="date" value={formData.measurementDate} onChange={(e) => setFormData({ ...formData, measurementDate: e.target.value })} /></label>
              <label className="space-y-1 text-sm font-bold text-[#3D2C22]">Peso (kg)<Input className={inputClass()} inputMode="decimal" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="Ex.: 7,2" /></label>
              <label className="space-y-1 text-sm font-bold text-[#3D2C22]">Estatura (cm)<Input className={inputClass()} inputMode="decimal" value={formData.stature} onChange={(e) => setFormData({ ...formData, stature: e.target.value })} placeholder="Ex.: 65" /></label>
              <label className="space-y-1 text-sm font-bold text-[#3D2C22]">Perímetro cefálico (cm)<Input className={inputClass()} inputMode="decimal" value={formData.headCircumference} onChange={(e) => setFormData({ ...formData, headCircumference: e.target.value })} placeholder="Ex.: 42" /></label>
            </div>
            <textarea className="min-h-20 w-full rounded-2xl border border-[#E9D8CF] bg-white px-3 py-2 text-sm text-[#3D2C22] placeholder:text-[#B8A79E]" placeholder="Observações para a consulta..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
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
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="subtle-label">Curva selecionada</p><h2 className="font-black text-[#3D2C22]">{curveDefinition?.label ?? currentMetric.help}</h2><p className="mt-1 text-xs text-muted-foreground">{activeChild ? `${activeChild.sex === 'female' ? 'Menina' : 'Menino'} · ${curveDefinition?.ageRange ?? '-'} anos` : 'Cadastre a criança para selecionar por sexo e idade.'}</p></div>
              <TrendingUp className="text-accent" />
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5">
              {Z_SCORE_LINES.map((z) => <span key={z} className="rounded-full bg-[#F5F0EC] px-2.5 py-1 text-[11px] font-bold text-[#8B7264]">z {z > 0 ? `+${z}` : z}</span>)}
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <XAxis dataKey="ageMonths" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'idade (meses)', position: 'insideBottom', offset: -2, fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row: any = payload[0].payload;
                  return <div className="rounded-2xl border border-border bg-white p-3 text-xs shadow-lg"><p className="font-black text-[#3D2C22]">{row.userDate ? 'Medição da criança' : 'Linha de referência'}</p><p>Idade: {row.userAge ?? `${row.ageMonths} meses`}</p>{row.userValue && <p>Valor: {Number(row.userValue).toFixed(1)} {currentUnit}</p>}<p className="mt-1 text-muted-foreground">{row.classification ?? 'Escore-z de referência.'}</p></div>;
                }} />
                {curveDefinition?.hasOfficialDataset && Z_SCORE_LINES.map((z) => <Line key={z} type="monotone" dataKey={getZScoreDataKey(z)} stroke={z === 0 ? '#C96B56' : '#C8B8AF'} strokeWidth={z === 0 ? 2.5 : 1.4} dot={false} connectNulls />)}
                <Line type="monotone" dataKey="userValue" name="Criança" stroke="#F0A48F" strokeWidth={0} dot={{ fill: '#F0A48F', r: 6, strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>

            {!curveDefinition?.hasOfficialDataset && <p className="mt-3 rounded-2xl bg-[#FFF8EA] p-3 text-xs leading-relaxed text-[#8B5D1E]">Estrutura preparada para as curvas OMS/Caderneta, com linhas z -3 a +3. Os datasets oficiais ainda precisam ser inseridos em <code>client/src/lib/growthCurves.ts</code>; por segurança, o app não inventa curvas falsas.</p>}
            {records.length === 0 && <p className="mt-2 text-center text-xs text-muted-foreground">Os pontos da criança aparecerão depois que você salvar uma medição real.</p>}
          </Card>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <Card className="p-4"><Baby className="mb-2 text-primary" /><h3 className="font-black text-[#3D2C22]">Como usar</h3><p className="mt-1 text-sm text-muted-foreground">Cadastre sexo e nascimento, registre medidas reais e acompanhe os pontos no gráfico.</p></Card>
          <Card className="p-4"><Info className="mb-2 text-accent" /><h3 className="font-black text-[#3D2C22]">Atenção</h3><p className="mt-1 text-sm text-muted-foreground">Os gráficos são ferramentas de acompanhamento e não substituem consulta pediátrica.</p></Card>
          <Card className="p-4"><Sparkles className="mb-2 text-secondary" /><h3 className="font-black text-[#3D2C22]">Caderneta</h3><p className="mt-1 text-sm text-muted-foreground">A referência segue a lógica da Caderneta da Criança: curvas por sexo, idade e tipo de medida.</p></Card>
        </section>

        {records.length > 0 && (
          <section className="space-y-3">
            <h2 className="section-title">Últimos registros</h2>
            {records.slice(-5).reverse().map((record) => {
              const stature = getStature(record);
              const bmi = calculateBMI(record.weight, stature);
              return <Card key={record.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-[#3D2C22]">{new Date(record.date).toLocaleDateString('pt-BR')}</p><p className="mt-1 text-sm text-muted-foreground">Peso {record.weight ?? '-'} kg · Estatura {stature ?? '-'} cm · IMC {bmi ?? '-'} · Perímetro cefálico {record.headCircumference ?? '-'} cm</p>{record.notes && <p className="mt-2 text-xs italic text-muted-foreground">{record.notes}</p>}</div><Ruler className="shrink-0 text-accent" /></div></Card>;
            })}
          </section>
        )}
      </div>
    </AppLayout>
  );
}
