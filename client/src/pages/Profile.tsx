import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Plus, Syringe, Shield, Trash2, Edit, Moon, Sun } from 'lucide-react';
import { VACCINES, CONTACT, EDUCATIONAL_MESSAGES } from '@shared/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { useActiveChild } from '@/contexts/ActiveChildContext';
import * as storage from '@/lib/storage';
import type { Child } from '@shared/types';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('children');
  const { theme, toggleTheme, switchable } = useTheme();
  const { activeChild, children, setActiveChild, refreshChildren } = useActiveChild();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    sex: 'female' as 'male' | 'female',
    premature: false,
    feedingType: 'breastfeeding' as 'breastfeeding' | 'formula' | 'mixed',
  });

  const handleAddChild = async () => {
    if (!formData.name || !formData.dateOfBirth) {
      alert('Preencha nome e data de nascimento');
      return;
    }

    const newChild: Child = {
      id: `child-${Date.now()}`,
      name: formData.name,
      dateOfBirth: new Date(formData.dateOfBirth).getTime(),
      sex: formData.sex,
      premature: formData.premature,
      feedingType: formData.feedingType,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.addChild(newChild);
    await refreshChildren();
    setActiveChild(newChild);
    setShowAddForm(false);
    setFormData({
      name: '',
      dateOfBirth: '',
      sex: 'female',
      premature: false,
      feedingType: 'breastfeeding',
    });
  };

  const handleDeleteChild = async (childId: string) => {
    if (confirm('Tem certeza que deseja deletar esta criança e todos seus dados?')) {
      await storage.deleteChild(childId);
      await refreshChildren();
        if (activeChild?.id === childId) {
        const remaining = children.filter(c => c.id !== childId);
        if (remaining.length > 0) {
          setActiveChild(remaining[0]);
        }
      }
    }
  };

  const handleClearAllData = async () => {
    if (confirm('ATENÇÃO: Isso deletará TODOS os dados do aplicativo. Esta ação não pode ser desfeita. Tem certeza?')) {
      await storage.clearAllData();
      await refreshChildren();
      setShowAddForm(true);
    }
  };

  const handleExportData = async () => {
    if (!activeChild) return;
    
    const growthRecords = await storage.getGrowthRecordsForChild(activeChild.id);
    const feedingSessions = await storage.getFeedingSessionsForChild(activeChild.id);
    const diaperEntries = await storage.getDiaperEntriesForChild(activeChild.id);
    const sleepEntries = await storage.getSleepEntriesForChild(activeChild.id);
    const vaccineRecords = await storage.getVaccineRecordsForChild(activeChild.id);

    const exportData = {
      child: activeChild,
      growthRecords,
      feedingSessions,
      diaperEntries,
      sleepEntries,
      vaccineRecords,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cuidar-${activeChild.name}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const calculateAge = (dateOfBirth: number) => {
    const now = new Date();
    const birth = new Date(dateOfBirth);
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months };
  };

  return (
    <AppLayout>
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Perfil</h1>
          <p className="text-muted-foreground">Gerencie perfis de crianças e configurações</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="children">Crianças</TabsTrigger>
            <TabsTrigger value="vaccines">Vacinas</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Crianças */}
          <TabsContent value="children" className="space-y-4">
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus size={20} className="mr-2" />
              {showAddForm ? 'Cancelar' : 'Adicionar Criança'}
            </Button>

            {showAddForm && (
              <Card className="p-4 space-y-3">
                <Input
                  placeholder="Nome da criança"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value as 'male' | 'female' })}
                >
                  <option value="female">Menina</option>
                  <option value="male">Menino</option>
                </select>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.feedingType}
                  onChange={(e) => setFormData({ ...formData, feedingType: e.target.value as 'breastfeeding' | 'formula' | 'mixed' })}
                >
                  <option value="breastfeeding">Aleitamento</option>
                  <option value="formula">Fórmula</option>
                  <option value="mixed">Misto</option>
                </select>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.premature}
                    onChange={(e) => setFormData({ ...formData, premature: e.target.checked })}
                  />
                  <span>Prematuro</span>
                </label>
                <Button className="w-full bg-primary" onClick={handleAddChild}>
                  Salvar Criança
                </Button>
              </Card>
            )}

            {children.map((child) => {
              const age = calculateAge(child.dateOfBirth);
              const isActive = activeChild?.id === child.id;
              return (
                <Card key={child.id} className={`p-4 ${isActive ? 'bg-primary/10 border-primary' : ''}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{child.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {age.years} ano{age.years !== 1 ? 's' : ''} e {age.months} mês{age.months !== 1 ? 'es' : ''}
                      </p>
                    </div>
                    <span className="text-3xl">{child.sex === 'female' ? '👧' : '👦'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Alimentação</p>
                      <p className="font-semibold">
                        {child.feedingType === 'breastfeeding' ? 'Aleitamento' : child.feedingType === 'formula' ? 'Fórmula' : 'Misto'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Condição</p>
                      <p className="font-semibold">{child.premature ? 'Prematuro' : 'A termo'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setActiveChild(child)}
                    >
                      {isActive ? '✓ Ativa' : 'Ativar'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteChild(child.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          {/* Vacinas */}
          <TabsContent value="vaccines" className="space-y-4">
            {activeChild ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Calendário de vacinas para {activeChild.name}
                </p>
                {VACCINES.map((vaccine) => (
                  <Card key={vaccine.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Syringe size={16} className="text-primary" />
                          {vaccine.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{vaccine.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Recomendado aos {vaccine.recommendedAgeMonths} meses
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Registrar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <Shield size={32} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Selecione uma criança para ver o calendário de vacinas</p>
              </Card>
            )}
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="settings" className="space-y-4">
            {/* Aparência */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Aparência</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                  <span className="text-sm">Modo {theme === 'dark' ? 'Escuro' : 'Claro'}</span>
                </div>
                {switchable && (
                  <Button variant="outline" size="sm" onClick={toggleTheme}>
                    Alternar
                  </Button>
                )}
              </div>
            </Card>

            {/* Dados */}
            <Card className="p-4 space-y-3">
              <h3 className="font-semibold mb-3">Dados</h3>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleExportData}
                disabled={!activeChild}
              >
                Exportar Dados
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleClearAllData}
              >
                Deletar Todos os Dados
              </Button>
            </Card>

            {/* Privacidade */}
            <Card className="p-4 space-y-3">
              <h3 className="font-semibold mb-3">Privacidade e Segurança</h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <strong>Armazenamento Local:</strong> {EDUCATIONAL_MESSAGES.storage.info}
                </p>
                <p className="text-muted-foreground">
                  <strong>Aviso Educativo:</strong> Este aplicativo é apenas informativo e não substitui orientação profissional. Sempre consulte seu pediatra.
                </p>
                <p className="text-muted-foreground">
                  <strong>LGPD:</strong> Seus dados são armazenados apenas no seu dispositivo e nunca são compartilhados.
                </p>
              </div>
            </Card>

            {/* Contato */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Suporte</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Tem dúvidas ou sugestões? Entre em contato conosco.
              </p>
              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button className="w-full bg-accent hover:bg-accent/90">
                  Fale com o Instituto Naves
                </Button>
              </a>
            </Card>

            {/* Sobre */}
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Sobre</h3>
              <p className="text-xs text-muted-foreground">
                Cuidar com Dra. Bárbara v1.0.0<br />
                Desenvolvido com ❤️ pelo Instituto Naves
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
