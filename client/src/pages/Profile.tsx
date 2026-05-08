import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Baby, CalendarDays, ExternalLink, Instagram, MapPin, MessageCircle, Moon, Plus, Shield, Stethoscope, Sun, Trash2, UserRound } from 'lucide-react';
import { VACCINES, CONTACT, EDUCATIONAL_MESSAGES, DOCTOR } from '@shared/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { useActiveChild } from '@/contexts/ActiveChildContext';
import * as storage from '@/lib/storage';
import type { Child } from '@shared/types';

function getInitialTab() {
  if (typeof window === 'undefined') return 'children';
  return new URLSearchParams(window.location.search).get('tab') || 'children';
}

function calculateAge(dateOfBirth: number) {
  const now = new Date();
  const birth = new Date(dateOfBirth);
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) { years--; months += 12; }
  return { years, months };
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const { theme, toggleTheme, switchable } = useTheme();
  const { activeChild, children, setActiveChild, refreshChildren } = useActiveChild();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    sex: 'female' as 'male' | 'female',
    premature: false,
    feedingType: 'breastfeeding' as 'breastfeeding' | 'formula' | 'mixed',
    parentName: '',
    city: '',
    state: 'PA',
  });

  useEffect(() => {
    if (!children.length) setShowAddForm(true);
  }, [children.length]);

  const handleAddChild = async () => {
    if (!formData.name || !formData.dateOfBirth) {
      alert('Preencha nome e data de nascimento.');
      return;
    }

    const newChild: Child = {
      id: `child-${Date.now()}`,
      name: formData.name,
      dateOfBirth: new Date(formData.dateOfBirth).getTime(),
      sex: formData.sex,
      premature: formData.premature,
      feedingType: formData.feedingType,
      parentName: formData.parentName || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.addChild(newChild);
    await refreshChildren();
    setActiveChild(newChild);
    setShowAddForm(false);
    setFormData({ name: '', dateOfBirth: '', sex: 'female', premature: false, feedingType: 'breastfeeding', parentName: '', city: '', state: 'PA' });
  };

  const handleDeleteChild = async (childId: string) => {
    if (confirm('Tem certeza que deseja deletar esta criança e todos os dados dela?')) {
      await storage.deleteChild(childId);
      await refreshChildren();
      if (activeChild?.id === childId) {
        const remaining = children.filter((child) => child.id !== childId);
        if (remaining.length > 0) setActiveChild(remaining[0]);
      }
    }
  };

  const handleClearAllData = async () => {
    if (confirm('ATENÇÃO: isso apagará todos os dados salvos neste dispositivo. Deseja continuar?')) {
      await storage.clearAllData();
      await refreshChildren();
      setShowAddForm(true);
    }
  };

  const handleExportData = async () => {
    if (!activeChild) return;
    const [growthRecords, feedingSessions, diaperEntries, sleepEntries, vaccineRecords] = await Promise.all([
      storage.getGrowthRecordsForChild(activeChild.id),
      storage.getFeedingSessionsForChild(activeChild.id),
      storage.getDiaperEntriesForChild(activeChild.id),
      storage.getSleepEntriesForChild(activeChild.id),
      storage.getVaccineRecordsForChild(activeChild.id),
    ]);

    const summary = [
      `Resumo da criança — ${activeChild.name}`,
      `Nascimento: ${new Date(activeChild.dateOfBirth).toLocaleDateString('pt-BR')}`,
      `Alimentação: ${activeChild.feedingType}`,
      `Medidas registradas: ${growthRecords.length}`,
      `Mamadas registradas: ${feedingSessions.length}`,
      `Fraldas registradas: ${diaperEntries.length}`,
      `Sono registrado: ${sleepEntries.length}`,
      `Vacinas registradas: ${vaccineRecords.length}`,
    ].join('\n');

    await navigator.clipboard?.writeText(summary);
    alert('Resumo copiado. Cole no WhatsApp ou salve para a consulta.');
  };

  const activeAge = activeChild ? calculateAge(activeChild.dateOfBirth) : null;

  return (
    <AppLayout>
      <div className="container space-y-5 py-5 sm:py-6">
        <section className="glass-card overflow-hidden">
          <div className="grid bg-gradient-to-br from-[#FFF7F3] via-white to-[#EAF7EF] md:grid-cols-[1.15fr_0.85fr]">
            <div className="p-5 sm:p-7">
              <span className="medical-chip">Perfil e contato</span>
              <h1 className="mt-4 text-3xl font-black leading-tight text-[#3D2C22]">Dados da criança e acesso à clínica</h1>
              <p className="mt-2 text-sm leading-relaxed text-[#6F5B50]">Gerencie perfis, veja vacinas, copie resumo e fale com o Instituto Naves sem misturar contato com conteúdos educativos.</p>
            </div>
            <div className="relative min-h-48 overflow-hidden bg-white/40 md:min-h-72">
              <img src={DOCTOR.instituteLogo} alt="Instituto Naves" className="absolute inset-0 m-auto max-h-[80%] max-w-[82%] object-contain" />
            </div>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-4 rounded-[1.4rem] bg-white/80 p-1 shadow-sm">
            <TabsTrigger value="children" className="rounded-2xl py-3 text-xs"><UserRound size={15} className="mr-1" />Criança</TabsTrigger>
            <TabsTrigger value="vaccines" className="rounded-2xl py-3 text-xs"><Shield size={15} className="mr-1" />Vacinas</TabsTrigger>
            <TabsTrigger value="contact" className="rounded-2xl py-3 text-xs"><MessageCircle size={15} className="mr-1" />Contato</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-2xl py-3 text-xs"><Stethoscope size={15} className="mr-1" />Dados</TabsTrigger>
          </TabsList>

          <TabsContent value="children" className="space-y-4 pt-4">
            {activeChild && activeAge && <Card className="overflow-hidden p-0"><div className="bg-gradient-to-br from-[#FCEAE5] to-[#FFF7F3] p-5"><div className="flex items-start justify-between gap-3"><div><p className="subtle-label">Criança ativa</p><h2 className="mt-1 text-2xl font-black text-[#3D2C22]">{activeChild.name}</h2><p className="mt-1 text-sm text-[#6F5B50]">{activeAge.years} ano{activeAge.years !== 1 ? 's' : ''} e {activeAge.months} mês{activeAge.months !== 1 ? 'es' : ''}</p></div><span className="text-4xl">{activeChild.sex === 'female' ? '👧' : '👦'}</span></div></div><div className="grid grid-cols-2 gap-3 p-5 text-sm"><Info label="Nascimento" value={new Date(activeChild.dateOfBirth).toLocaleDateString('pt-BR')} /><Info label="Alimentação" value={activeChild.feedingType === 'breastfeeding' ? 'Aleitamento' : activeChild.feedingType === 'formula' ? 'Fórmula' : 'Misto'} /><Info label="Condição" value={activeChild.premature ? 'Prematuro' : 'A termo'} /><Info label="Responsável" value={activeChild.parentName || 'Não informado'} /></div></Card>}

            <Button className="w-full rounded-2xl py-6 font-extrabold" onClick={() => setShowAddForm(!showAddForm)}><Plus size={18} className="mr-2" />{showAddForm ? 'Fechar cadastro' : 'Cadastrar nova criança'}</Button>

            {showAddForm && <Card className="space-y-3 p-4"><Input placeholder="Nome da criança" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /><Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} /><div className="grid grid-cols-2 gap-2"><select className="rounded-2xl border border-border bg-white px-3 py-3 text-sm" value={formData.sex} onChange={(e) => setFormData({ ...formData, sex: e.target.value as 'male' | 'female' })}><option value="female">Menina</option><option value="male">Menino</option></select><select className="rounded-2xl border border-border bg-white px-3 py-3 text-sm" value={formData.feedingType} onChange={(e) => setFormData({ ...formData, feedingType: e.target.value as any })}><option value="breastfeeding">Aleitamento</option><option value="formula">Fórmula</option><option value="mixed">Misto</option></select></div><Input placeholder="Responsável" value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} /><div className="grid grid-cols-2 gap-2"><Input placeholder="Cidade" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} /><Input placeholder="UF" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} /></div><label className="flex items-center gap-2 rounded-2xl bg-[#F5F0EC] p-3 text-sm"><input type="checkbox" checked={formData.premature} onChange={(e) => setFormData({ ...formData, premature: e.target.checked })} /><span>Prematuro</span></label><Button className="w-full rounded-2xl py-6" onClick={handleAddChild}>Salvar criança</Button></Card>}

            <div className="space-y-3">{children.map((child) => { const age = calculateAge(child.dateOfBirth); const isActive = activeChild?.id === child.id; return <Card key={child.id} className={`p-4 ${isActive ? 'border-primary bg-primary/10' : ''}`}><div className="flex items-start justify-between gap-3"><div><h3 className="font-black text-[#3D2C22]">{child.name}</h3><p className="text-sm text-muted-foreground">{age.years} ano{age.years !== 1 ? 's' : ''} e {age.months} mês{age.months !== 1 ? 'es' : ''}</p></div><span className="text-3xl">{child.sex === 'female' ? '👧' : '👦'}</span></div><div className="mt-4 flex gap-2"><Button variant="outline" size="sm" className="flex-1 rounded-2xl" onClick={() => setActiveChild(child)}>{isActive ? '✓ Ativa' : 'Ativar'}</Button><Button variant="outline" size="sm" className="rounded-2xl" onClick={() => handleDeleteChild(child.id)}><Trash2 size={16} /></Button></div></Card>; })}</div>
          </TabsContent>

          <TabsContent value="vaccines" className="space-y-3 pt-4">
            <Card className="border-secondary/20 bg-secondary/5 p-4 text-sm text-muted-foreground">Calendário informativo. Confirme sempre com a pediatra ou serviço de vacinação.</Card>
            {VACCINES.map((vaccine) => <Card key={vaccine.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><h4 className="font-black text-[#3D2C22]">{vaccine.name}</h4><p className="mt-1 text-sm text-muted-foreground">{vaccine.description}</p><p className="mt-1 text-xs font-bold text-primary">Recomendado aos {vaccine.recommendedAgeMonths} meses</p></div><CalendarDays className="shrink-0 text-secondary" /></div></Card>)}
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 pt-4">
            <Card className="overflow-hidden p-0"><div className="bg-gradient-to-br from-[#EAF7EF] to-white p-5"><p className="subtle-label">Contato institucional</p><h2 className="mt-1 text-2xl font-black text-[#3D2C22]">Instituto Naves</h2><p className="mt-2 text-sm text-muted-foreground">{CONTACT.address}</p></div><div className="grid gap-2 p-5"><Button className="rounded-2xl py-6" onClick={() => window.open(CONTACT.whatsappUrl, '_blank')}><MessageCircle className="mr-2" />Falar com a clínica</Button><Button variant="outline" className="rounded-2xl py-6" onClick={() => window.open(CONTACT.whatsappUrl, '_blank')}>Agendar consulta</Button><Button variant="outline" className="rounded-2xl py-6" onClick={() => window.open(CONTACT.instagramDoctor, '_blank')}><Instagram className="mr-2" />Instagram Dra. Bárbara</Button><Button variant="outline" className="rounded-2xl py-6" onClick={() => window.open(CONTACT.mapsUrl, '_blank')}><MapPin className="mr-2" />Abrir localização</Button><Button variant="outline" className="rounded-2xl py-6" onClick={() => window.open(CONTACT.website, '_blank')}><ExternalLink className="mr-2" />Site oficial</Button></div></Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 pt-4">
            <Card className="p-4"><h3 className="font-black text-[#3D2C22]">Aparência</h3><div className="mt-3 flex items-center justify-between"><div className="flex items-center gap-2">{theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}<span className="text-sm">Modo {theme === 'dark' ? 'Escuro' : 'Claro'}</span></div>{switchable && <Button variant="outline" size="sm" onClick={toggleTheme}>Alternar</Button>}</div></Card>
            <Card className="space-y-3 p-4"><h3 className="font-black text-[#3D2C22]">Dados salvos neste dispositivo</h3><p className="text-sm text-muted-foreground">{EDUCATIONAL_MESSAGES.storage.info}</p><Button variant="outline" className="w-full rounded-2xl" onClick={handleExportData} disabled={!activeChild}>Copiar resumo</Button><Button variant="destructive" className="w-full rounded-2xl" onClick={handleClearAllData}>Apagar todos os dados</Button></Card>
            <Card className="p-4"><Shield className="mb-2 text-secondary" /><h3 className="font-black text-[#3D2C22]">Privacidade</h3><p className="mt-1 text-sm text-muted-foreground">No MVP, os dados são armazenados localmente e não substituem avaliação médica.</p></Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-bold uppercase text-muted-foreground">{label}</p><p className="mt-1 font-black text-[#3D2C22]">{value}</p></div>;
}
