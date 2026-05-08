'use client';

import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Download, ExternalLink, FileText, HelpCircle, Image as ImageIcon, Play, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DOCTOR, FAQS, GALLERY_ITEMS, MATERIALS, VIDEOS } from '@shared/constants';

function getInitialTab() {
  if (typeof window === 'undefined') return 'materials';
  return new URLSearchParams(window.location.search).get('tab') || 'materials';
}

function getMaterialAccent(category: string) {
  if (category.includes('Caderneta')) return 'from-[#F6F0FF] to-[#F3ECFF] text-[#6E5794]';
  if (category.includes('BLW') || category.includes('Introdução')) return 'from-[#FFF4E3] to-[#FFEBDD] text-[#A9623F]';
  if (category.includes('Sono')) return 'from-[#EEF5FF] to-[#EAF2FF] text-[#57749A]';
  if (category.includes('Desenvolvimento')) return 'from-[#EFFAEF] to-[#EAF7EF] text-[#4D8763]';
  return 'from-[#FCEAE5] to-[#FFF6F2] text-[#C96B56]';
}

function filterChipClass(isActive: boolean) {
  return isActive
    ? 'shrink-0 rounded-full border-0 bg-[#FCEAE5] font-bold text-[#C96B56] shadow-sm hover:bg-[#F8DCD5]'
    : 'shrink-0 rounded-full border-0 bg-[#F5F0EC] font-bold text-[#8B7264] hover:bg-[#EEE7E1]';
}

const shortcutCards = [
  { id: 'materials', title: 'PDFs gratuitos', description: 'Cadernetas, BLW, introdução alimentar e guias.', icon: FileText },
  { id: 'videos', title: 'Vídeos', description: 'Participações e conteúdos educativos.', icon: Play },
  { id: 'gallery', title: 'Galeria', description: 'Fotos institucionais e atendimentos autorizados.', icon: ImageIcon },
  { id: 'faq', title: 'FAQ', description: 'Dúvidas rápidas por tema.', icon: HelpCircle },
];

export default function Content() {
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<(typeof VIDEOS)[number] | null>(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<(typeof GALLERY_ITEMS)[number] | null>(null);

  const materialCategories = useMemo(() => Array.from(new Set(MATERIALS.map((material) => material.category))), []);
  const faqCategories = useMemo(() => Array.from(new Set(FAQS.map((faq) => faq.category))), []);

  const filteredMaterials = MATERIALS.filter((material) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = material.title.toLowerCase().includes(q) || material.description.toLowerCase().includes(q) || material.category.toLowerCase().includes(q);
    const matchesCategory = !selectedCategory || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredVideos = VIDEOS.filter((video) => {
    const q = searchQuery.toLowerCase();
    return video.title.toLowerCase().includes(q) || video.description.toLowerCase().includes(q) || video.category.toLowerCase().includes(q);
  });

  const filteredFAQs = FAQS.filter((faq) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q) || faq.category.toLowerCase().includes(q);
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.order - b.order);

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    setSelectedCategory(null);
    setSearchQuery('');
    setSelectedVideo(null);
  };

  const isLocalVideo = selectedVideo?.videoUrl?.endsWith('.mp4');

  return (
    <AppLayout>
      <div className="container space-y-5 py-5 sm:py-6">
        <section className="glass-card overflow-hidden">
          <div className="grid md:grid-cols-[1.1fr_0.9fr]">
            <div className="p-5 sm:p-7 md:p-8">
              <span className="medical-chip">Biblioteca educativa</span>
              <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#3D2C22] md:text-5xl">Conteúdos para apoiar a família</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#6F5B50] md:text-base">
                Materiais gratuitos, vídeos, galeria e dúvidas frequentes. Contatos da clínica ficam separados na aba Perfil.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {shortcutCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => switchTab(item.id)}
                      className={`rounded-[1.25rem] p-3 text-left shadow-sm transition active:scale-[0.98] ${activeTab === item.id ? 'bg-[#FCEAE5] text-[#C96B56]' : 'bg-white text-[#8B7264] hover:bg-[#FFFAF7]'}`}
                    >
                      <Icon size={18} className="mb-2" />
                      <p className="text-sm font-extrabold">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-snug opacity-80">{item.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="relative min-h-60 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 md:min-h-80">
              <img src={DOCTOR.aboutImage} alt="Dra. Bárbara Naves" className="absolute inset-0 h-full w-full object-contain object-bottom p-2" />
            </div>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={switchTab} className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-4 rounded-[1.4rem] bg-white/80 p-1 shadow-sm">
            <TabsTrigger value="materials" className="rounded-2xl py-3 text-xs sm:text-sm"><FileText size={16} className="mr-1" />PDFs</TabsTrigger>
            <TabsTrigger value="videos" className="rounded-2xl py-3 text-xs sm:text-sm"><Play size={16} className="mr-1" />Vídeos</TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-2xl py-3 text-xs sm:text-sm"><ImageIcon size={16} className="mr-1" />Galeria</TabsTrigger>
            <TabsTrigger value="faq" className="rounded-2xl py-3 text-xs sm:text-sm"><HelpCircle size={16} className="mr-1" />FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="space-y-4 pt-3">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar por BLW, sono, caderneta..." />
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Button variant="outline" size="sm" className={filterChipClass(!selectedCategory)} onClick={() => setSelectedCategory(null)}>Todos</Button>
              {materialCategories.map((category) => <Button key={category} variant="outline" size="sm" className={filterChipClass(selectedCategory === category)} onClick={() => setSelectedCategory(category)}>{category}</Button>)}
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredMaterials.map((material) => {
                const accent = getMaterialAccent(material.category);
                return (
                  <Card key={material.id} className="group overflow-hidden border-white/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
                    <div className={`bg-gradient-to-br ${accent} p-5`}>
                      <div className="mb-8 flex items-center justify-between"><span className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold shadow-sm">{material.category}</span><BookOpen className="opacity-70" /></div>
                      <h3 className="line-clamp-2 text-2xl font-black leading-tight text-[#3D2C22]">{material.title}</h3>
                    </div>
                    <div className="space-y-4 p-5">
                      <p className="line-clamp-3 text-sm text-muted-foreground">{material.description}</p>
                      {material.ageIndicationMonths && <span className="inline-flex rounded-full bg-[#EEF5FF] px-3 py-1 text-xs font-semibold text-[#57749A]">{material.ageIndicationMonths.min === 0 && material.ageIndicationMonths.max === 0 ? 'Gestação / pré-natal' : `${material.ageIndicationMonths.min}-${material.ageIndicationMonths.max} meses`}</span>}
                      <div className="grid grid-cols-2 gap-2"><Button className="rounded-2xl" onClick={() => window.open(material.fileName || '#', '_blank')}><ExternalLink size={14} className="mr-1" /> Abrir</Button><Button variant="outline" className="rounded-2xl" onClick={() => { const link = document.createElement('a'); link.href = material.fileName || ''; link.download = material.fileName?.split('/').pop() || 'material.pdf'; link.click(); }}><Download size={14} className="mr-1" /> Baixar</Button></div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4 pt-3">
            {selectedVideo ? <VideoPlayer video={selectedVideo} isLocalVideo={!!isLocalVideo} onBack={() => setSelectedVideo(null)} /> : <><SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar vídeos..." /><div className="grid gap-4 md:grid-cols-2">{filteredVideos.map((video) => <Card key={video.id} className="group overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-xl"><button className="block w-full text-left" onClick={() => setSelectedVideo(video)}><div className="relative aspect-video overflow-hidden bg-muted"><img src={video.thumbnailUrl || DOCTOR.aboutImage} alt={video.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 flex items-center justify-center bg-black/20"><span className="rounded-full bg-white/90 p-4 text-primary shadow-lg"><Play fill="currentColor" /></span></div>{!video.videoUrl && <span className="absolute left-3 top-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">MP4 pendente</span>}</div><div className="p-5"><span className="rounded-full bg-[#FCEAE5] px-3 py-1 text-xs font-bold text-[#C96B56]">{video.category}</span><h3 className="mt-3 text-xl font-black text-[#3D2C22]">{video.title}</h3><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{video.description}</p></div></button></Card>)}</div></>}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4 pt-3">
            <Card className="border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">Galeria com fotos reais. Use fotos de pacientes/crianças somente com autorização expressa dos responsáveis.</Card>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{GALLERY_ITEMS.map((item, index) => <button key={item.id} onClick={() => setSelectedGalleryImage(item)} className={index === 0 ? 'group col-span-2 overflow-hidden rounded-[1.6rem] bg-white shadow-sm md:row-span-2' : 'group overflow-hidden rounded-[1.6rem] bg-white shadow-sm'}><div className={index === 0 ? 'h-72 md:h-full' : 'h-48'}><img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div><div className="p-3 text-left"><p className="text-xs font-semibold text-primary">{item.category}</p><h3 className="font-bold text-[#3D2C22]">{item.title}</h3></div></button>)}</div>
            {selectedGalleryImage && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" onClick={() => setSelectedGalleryImage(null)}><div className="max-h-[90vh] max-w-4xl overflow-hidden rounded-[2rem] bg-white" onClick={(event) => event.stopPropagation()}><img src={selectedGalleryImage.imageUrl} alt={selectedGalleryImage.title} className="max-h-[72vh] w-full object-contain bg-black" /><div className="p-5"><p className="text-xs font-semibold text-primary">{selectedGalleryImage.category}</p><h3 className="text-xl font-black text-[#3D2C22]">{selectedGalleryImage.title}</h3><p className="mt-1 text-sm text-muted-foreground">{selectedGalleryImage.description}</p><Button className="mt-4 w-full rounded-2xl" onClick={() => setSelectedGalleryImage(null)}>Fechar</Button></div></div></div>}
          </TabsContent>

          <TabsContent value="faq" className="space-y-4 pt-3">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar dúvida..." />
            <div className="flex gap-2 overflow-x-auto pb-1"><Button variant="outline" size="sm" className={filterChipClass(!selectedCategory)} onClick={() => setSelectedCategory(null)}>Todas</Button>{faqCategories.map((category) => <Button key={category} variant="outline" size="sm" className={filterChipClass(selectedCategory === category)} onClick={() => setSelectedCategory(category)}>{category}</Button>)}</div>
            <div className="space-y-3">{filteredFAQs.map((faq) => <Card key={faq.id} className="p-4"><details><summary className="cursor-pointer text-base font-bold hover:text-primary">{faq.question}</summary><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p></details></Card>)}</div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /><Input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="h-12 rounded-2xl bg-white pl-11" /></div>;
}

function VideoPlayer({ video, isLocalVideo, onBack }: { video: (typeof VIDEOS)[number]; isLocalVideo: boolean; onBack: () => void }) {
  return <Card className="overflow-hidden p-0"><div className="aspect-video bg-[#1A1410]">{video.videoUrl ? (isLocalVideo ? <video controls src={video.videoUrl} poster={video.thumbnailUrl} className="h-full w-full" /> : <iframe src={video.videoUrl} title={video.title} className="h-full w-full" allowFullScreen />) : <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#3D2C22] to-[#1A1410] p-8 text-center text-white"><Play className="mb-3" size={44} /><h3 className="text-xl font-bold">Arquivo de vídeo pendente</h3><p className="mt-2 max-w-md text-sm text-white/75">Adicione o MP4 em /client/public/assets/videos para ativar o player local.</p></div>}</div><div className="p-5"><Button variant="outline" className="mb-4 rounded-2xl" onClick={onBack}>← Voltar aos vídeos</Button><h2 className="text-2xl font-black text-[#3D2C22]">{video.title}</h2><p className="mt-2 text-muted-foreground">{video.description}</p></div></Card>;
}
