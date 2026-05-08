import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Download, TrendingUp, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useActiveChild } from '@/contexts/ActiveChildContext';
import { useNotification } from '@/contexts/NotificationContext';
import * as storage from '@/lib/storage';
import type { GrowthRecord } from '@shared/types';

export default function Growth() {
  const { activeChild } = useActiveChild();
  const { addNotification } = useNotification();
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'length' | 'height' | 'headCircumference'>('weight');
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
      alert('Preencha pelo menos uma medida');
      return;
    }

    const record: GrowthRecord = {
      id: `growth-${Date.now()}`,
      childId: activeChild.id,
      date: new Date().setHours(0, 0, 0, 0),
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      length: formData.length ? parseFloat(formData.length) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      headCircumference: formData.headCircumference ? parseFloat(formData.headCircumference) : undefined,
      position: formData.position,
      location: formData.location,
      notes: formData.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.addGrowthRecord(record);
    await loadRecords();
    setShowForm(false);
    setFormData({
      weight: '',
      length: '',
      height: '',
      headCircumference: '',
      position: 'lying',
      location: 'home',
      notes: '',
    });
    
    const measurements = [];
    if (formData.weight) measurements.push(`Peso: ${formData.weight}kg`);
    if (formData.length) measurements.push(`Comprimento: ${formData.length}cm`);
    if (formData.height) measurements.push(`Altura: ${formData.height}cm`);
    if (formData.headCircumference) measurements.push(`PC: ${formData.headCircumference}cm`);
    
    addNotification({
      type: 'success',
      title: '✓ Medidas registradas',
      message: measurements.join(', '),
      duration: 4000,
    });
  };

  const handleExport = async () => {
    if (!activeChild || records.length === 0) {
      alert('Nenhum registro para exportar');
      return;
    }

    const exportData = {
      child: activeChild,
      growthRecords: records,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crescimento-${activeChild.name}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'weight':
        return 'Peso (kg)';
      case 'length':
        return 'Comprimento (cm)';
      case 'height':
        return 'Altura (cm)';
      case 'headCircumference':
        return 'Perímetro Cefálico (cm)';
      default:
        return '';
    }
  };

  const getMetricData = () => {
    return records
      .filter((r) => {
        if (selectedMetric === 'weight') return r.weight;
        if (selectedMetric === 'length') return r.length;
        if (selectedMetric === 'height') return r.height;
        if (selectedMetric === 'headCircumference') return r.headCircumference;
        return false;
      })
      .map((r) => ({
        date: new Date(r.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        value: selectedMetric === 'weight' ? r.weight : selectedMetric === 'length' ? r.length : selectedMetric === 'height' ? r.height : r.headCircumference,
        fullDate: new Date(r.date).toLocaleDateString('pt-BR'),
      }));
  };

  if (!activeChild) {
    return (
      <AppLayout>
        <div className="container py-8">
          <Card className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Selecione uma criança para acompanhar o crescimento</p>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const metricData = getMetricData();

  return (
    <AppLayout>
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Crescimento de {activeChild.name}</h1>
          <p className="text-muted-foreground">Acompanhe o desenvolvimento da criança</p>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={() => setShowForm(!showForm)}>
            <Plus size={20} className="mr-2" />
            {showForm ? 'Cancelar' : 'Novo Registro'}
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={records.length === 0}>
            <Download size={20} className="mr-2" />
            Exportar
          </Button>
        </div>

        {/* Formulário */}
        {showForm && (
          <Card className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold">Peso (kg)</label>
                <Input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="Ex: 5.2" />
              </div>
              <div>
                <label className="text-sm font-semibold">Comprimento (cm)</label>
                <Input type="number" step="0.1" value={formData.length} onChange={(e) => setFormData({ ...formData, length: e.target.value })} placeholder="Ex: 55" />
              </div>
              <div>
                <label className="text-sm font-semibold">Altura (cm)</label>
                <Input type="number" step="0.1" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} placeholder="Ex: 75" />
              </div>
              <div>
                <label className="text-sm font-semibold">Perímetro Cefálico (cm)</label>
                <Input type="number" step="0.1" value={formData.headCircumference} onChange={(e) => setFormData({ ...formData, headCircumference: e.target.value })} placeholder="Ex: 37" />
              </div>
            </div>

            <select className="w-full px-3 py-2 border rounded-md" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}>
              <option value="lying">Deitado (comprimento)</option>
              <option value="standing">Em pé (altura)</option>
            </select>

            <select className="w-full px-3 py-2 border rounded-md" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value as any })}>
              <option value="home">Casa</option>
              <option value="consultation">Consulta</option>
              <option value="vaccine">Vacinação</option>
              <option value="other">Outro</option>
            </select>

            <textarea className="w-full px-3 py-2 border rounded-md" placeholder="Observações..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />

            <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSaveRecord}>
              Salvar Registro
            </Button>
          </Card>
        )}

        {/* Seletor de métrica */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['weight', 'length', 'height', 'headCircumference'] as const).map((metric) => (
            <Button
              key={metric}
              variant={selectedMetric === metric ? 'default' : 'outline'}
              className="whitespace-nowrap"
              onClick={() => setSelectedMetric(metric)}
            >
              {getMetricLabel(metric)}
            </Button>
          ))}
        </div>

        {/* Gráfico */}
        {metricData.length > 0 ? (
          <Card className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metricData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => typeof value === 'number' ? value.toFixed(1) : value} />
                <Line type="monotone" dataKey="value" stroke="#E8B4C8" dot={{ fill: '#E8B4C8', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <TrendingUp size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Nenhum registro de {getMetricLabel(selectedMetric).toLowerCase()} ainda</p>
          </Card>
        )}

        {/* Últimos registros */}
        {records.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Últimos Registros</h3>
            <div className="space-y-2">
              {records.slice(-5).reverse().map((record) => (
                <Card key={record.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{new Date(record.date).toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs text-muted-foreground space-y-1">
                        {record.weight && <div>Peso: <strong>{record.weight} kg</strong></div>}
                        {record.length && <div>Comprimento: <strong>{record.length} cm</strong></div>}
                        {record.height && <div>Altura: <strong>{record.height} cm</strong></div>}
                        {record.headCircumference && <div>Perímetro Cefálico: <strong>{record.headCircumference} cm</strong></div>}
                      </p>
                      {record.notes && <p className="text-xs mt-2 italic">{record.notes}</p>}
                    </div>
                    <TrendingUp size={20} className="text-secondary flex-shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
