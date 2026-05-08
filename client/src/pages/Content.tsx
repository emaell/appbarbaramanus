'use client';

import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Download, ExternalLink, FileText, HelpCircle, Image as ImageIcon, MessageCircle, Play, Search, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CONTACT, DOCTOR, FAQS, GALLERY_ITEMS, MATERIALS, REVIEWS, VIDEOS } from '@shared/constants';

const emptySearch = '';

function getInitialTab() {
  if (typeof window === 'undefined') return 'materials';
  const params = new URLSearchParams(window.location.search);
  return params.get('tab') || 'materials';
}

function getMaterialAccent(category: string) {
  if (category.includes('Caderneta')) return 'from-violet-50 to-purple-50 text-violet-700';
  if (category.includes('BLW') || category.includes('Introdução')) return 'from-amber-50 to-orange-50 text-orange-700';
  if (category.includes('Sono')) return 'from-indigo-50 to-blue-50 text-blue-700';
  if (category.includes('Desenvolvimento')) return 'from-emerald-50 to-green-50 text-emerald-700';
  return 'from-pink-50 to-rose-50 text-primary';
}

export default function Content() {
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [searchQuery, setSearchQuery] = useState(emptySearch);
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

  const isLocalVideo = selectedVideo?.videoUrl?.endsWith('.mp4');

  return (
    <AppLayout>
      <div className="container space-y-7 py-6">
        <section className="glass-card overflow-hidden">
          <div className="grid md:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 md:p-8">
              <span className="medical-chip">Biblioteca gratuita</span>
              <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">Conteúdo para cuidar melhor, sem sair do app</h1>
              <p className="mt-4 max-w-xl text-muted-foreground">
                Materiais educativos reais, vídeos preparados para a Dra. Bárbara, galeria institucional e dúvidas frequentes em uma experiência mais organizada.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">PDFs gratuitos</span>
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">Vídeos</span>
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">Galeria</span>
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">FAQ</span>
              </div>
            </div>
            <div className="relative min-h-64 bg-gradient-to-br from-primary/10 to-secondary/10">
              <img src={DOCTOR.aboutImage} alt="Dra. Bárbara Naves" className="absolute inset-0 h-full w-full object-contain object-bottom p-2" />
            </div>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setSelectedCategory(null); setSearchQuery(''); }} className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-4 rounded-[1.4rem] bg-white/80 p-1 shadow-sm">
            <TabsTrigger value="materials" className="rounded-2xl py-3 text-xs sm:text-sm"><FileText size={16} className="mr-1" />Materiais</TabsTrigger>
            <TabsTrigger value="videos" className="rounded-2xl py-3 text-xs sm:text-sm"><Play size={16} className="mr-1" />Vídeos</TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-2xl py-3 text-xs sm:text-sm"><ImageIcon size={16} className="mr-1" />Galeria</TabsTrigger>
            <TabsTrigger value="faq" className="rounded-2xl py-3 text-xs sm:text-sm"><HelpCircle size={16} className="mr-1" />FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="space-y-4 pt-3">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input placeholder="Buscar por BLW, sono, caderneta, desenvolvimento..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-12 rounded-2xl bg-white pl-11" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <Button variant={!selectedCategory ? 'default' : 'outline'} size="sm" className="shrink-0 rounded-full" onClick={() => setSelectedCategory(null)}>Todos</Button>
                {materialCategories.map((category) => (
                  <Button key={category} variant={selectedCategory === category ? 'default' : 'outline'} size="sm" className="shrink-0 rounded-full" onClick={() => setSelectedCategory(category)}>
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredMaterials.map((material) => {
                const accent = getMaterialAccent(material.category);
                return (
                  <Card key={material.id} className="group overflow-hidden border-white/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
                    <div className={`bg-gradient-to-br ${accent} p-5`}>
                      <div className="mb-8 flex items-center justify-between">
                        <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold shadow-sm">{material.category}</span>
                        <BookOpen className="opacity-70" />
                      </div>
                      <h3 className="line-clamp-2 text-2xl font-black leading-tight text-[#33423a]">{material.title}</h3>
                    </div>
                    <div className="space-y-4 p-5">
                      <p className="line-clamp-3 text-sm text-muted-foreground">{material.description}</p>
                      {material.ageIndicationMonths && (
                        <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                          {material.ageIndicationMonths.min === 0 && material.ageIndicationMonths.max === 0
                            ? 'Gestação / pré-natal'
                            : `${material.ageIndicationMonths.min}-${material.ageIndicationMonths.max} meses`}
                        </span>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Button className="rounded-2xl" onClick={() => window.open(material.fileName || '#', '_blank')}>
                          <ExternalLink size={14} className="mr-1" /> Abrir
                        </Button>
                        <Button variant="outline" className="rounded-2xl" onClick={() => {
                          const link = document.createElement('a');
                          link.href = material.fileName || '';
                          link.download = material.fileName?.split('/').pop() || 'material.pdf';
                          link.click();
                        }}>
                          <Download size={14} className="mr-1" /> Baixar
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4 pt-3">
            {selectedVideo ? (
              <Card className="overflow-hidden p-0">
                <div className="aspect-video bg-black">
                  {selectedVideo.videoUrl ? (
                    isLocalVideo ? (
                      <video controls src={selectedVideo.videoUrl} poster={selectedVideo.thumbnailUrl} className="h-full w-full" />
                    ) : (
                      <iframe src={selectedVideo.videoUrl} title={selectedVideo.title} className="h-full w-full" allowFullScreen />
                    )
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#392735] to-[#182e28] p-8 text-center text-white">
                      <Play className="mb-3" size={44} />
                      <h3 className="text-xl font-bold">Arquivo de vídeo pendente</h3>
                      <p className="mt-2 max-w-md text-sm text-white/75">O card está pronto. Adicione o MP4 em /client/public/assets/videos para ativar o player local.</p>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <Button variant="outline" className="mb-4 rounded-2xl" onClick={() => setSelectedVideo(null)}>← Voltar aos vídeos</Button>
                  <h2 className="text-2xl font-black">{selectedVideo.title}</h2>
                  <p className="mt-2 text-muted-foreground">{selectedVideo.description}</p>
                </div>
              </Card>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input placeholder="Buscar vídeos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-12 rounded-2xl bg-white pl-11" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredVideos.map((video) => (
                    <Card key={video.id} className="group overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-xl">
                      <button className="block w-full text-left" onClick={() => setSelectedVideo(video)}>
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <img src={video.thumbnailUrl || DOCTOR.aboutImage} alt={video.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <span className="rounded-full bg-white/90 p-4 text-primary shadow-lg"><Play fill="currentColor" /></span>
                          </div>
                          {!video.videoUrl && <span className="absolute left-3 top-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">MP4 pendente</span>}
                        </div>
                        <div className="p-5">
                          <span className="medical-chip">{video.category}</span>
                          <h3 className="mt-3 text-xl font-black">{video.title}</h3>
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{video.description}</p>
                        </div>
                      </button>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4 pt-3">
            <Card className="border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
              Galeria com fotos reais. Use fotos de pacientes/crianças somente com autorização expressa dos responsáveis.
            </Card>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {GALLERY_ITEMS.map((item, index) => (
                <button key={item.id} onClick={() => setSelectedGalleryImage(item)} className={index === 0 ? 'group col-span-2 overflow-hidden rounded-[1.6rem] bg-white shadow-sm md:row-span-2' : 'group overflow-hidden rounded-[1.6rem] bg-white shadow-sm'}>
                  <div className={index === 0 ? 'h-72 md:h-full' : 'h-48'}>
                    <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-3 text-left">
                    <p className="text-xs font-semibold text-primary">{item.category}</p>
                    <h3 className="font-bold">{item.title}</h3>
                  </div>
                </button>
              ))}
            </div>
            {selectedGalleryImage && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" onClick={() => setSelectedGalleryImage(null)}>
                <div className="max-h-[90vh] max-w-4xl overflow-hidden rounded-[2rem] bg-white" onClick={(event) => event.stopPropagation()}>
                  <img src={selectedGalleryImage.imageUrl} alt={selectedGalleryImage.title} className="max-h-[72vh] w-full object-contain bg-black" />
                  <div className="p-5">
                    <p className="text-xs font-semibold text-primary">{selectedGalleryImage.category}</p>
                    <h3 className="text-xl font-black">{selectedGalleryImage.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{selectedGalleryImage.description}</p>
                    <Button className="mt-4 w-full rounded-2xl" onClick={() => setSelectedGalleryImage(null)}>Fechar</Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="faq" className="space-y-4 pt-3">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input placeholder="Buscar dúvida..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-12 rounded-2xl bg-white pl-11" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <Button variant={!selectedCategory ? 'default' : 'outline'} size="sm" className="shrink-0 rounded-full" onClick={() => setSelectedCategory(null)}>Todas</Button>
                {faqCategories.map((category) => (
                  <Button key={category} variant={selectedCategory === category ? 'default' : 'outline'} size="sm" className="shrink-0 rounded-full" onClick={() => setSelectedCategory(category)}>{category}</Button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {filteredFAQs.map((faq) => (
                <Card key={faq.id} className="p-4">
                  <details>
                    <summary className="cursor-pointer text-base font-bold hover:text-primary">{faq.question}</summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                  </details>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Card className="border-secondary/20 bg-secondary/5 p-5">
          <div className="flex items-start gap-3">
            <MessageCircle className="mt-1 text-secondary" />
            <div className="flex-1">
              <h3 className="font-black">Agendamento e contato</h3>
              <p className="mt-1 text-sm text-muted-foreground">{CONTACT.address}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button className="rounded-2xl" onClick={() => window.open(CONTACT.whatsappUrl, '_blank')}>WhatsApp</Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => window.open(CONTACT.mapsUrl, '_blank')}>Google Maps</Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Star className="mt-1 text-primary" />
            <div className="flex-1">
              <h3 className="font-black">Avaliações reais</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {REVIEWS.length ? 'Veja o que famílias reais disseram sobre o atendimento.' : 'Nenhuma avaliação real foi inserida no código. O app não usa depoimentos fictícios.'}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button variant="outline" className="rounded-2xl" onClick={() => window.open(CONTACT.googleReviewsUrl, '_blank')}>Ver avaliações no Google</Button>
                <Button className="rounded-2xl" onClick={() => window.open(CONTACT.googleReviewWriteUrl, '_blank')}>Avaliar no Google</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
