/**
 * Dados editoriais do app Cuidar com Dra. Bárbara.
 * Conteúdos médicos permanecem educativos e devem ser revisados pela equipe antes de produção.
 */

import type { Vaccine, Material, Video, FAQ, Review } from './types';

export const CONTACT = {
  whatsappUrl: 'https://wa.me/5594981964587?text=Ol%C3%A1!%20Vim%20pelo%20app%20Cuidar%20com%20Dra.%20B%C3%A1rbara%20e%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20consulta%20pedi%C3%A1trica.',
  instituteName: 'Instituto Naves',
  drName: 'Dra. Bárbara Naves',
  website: 'https://drabarbaranaves.com.br',
  instagramDoctor: 'https://www.instagram.com/drabarbaranaves',
  instagramInstitute: 'https://www.instagram.com/institutonaves',
  mapsUrl: 'https://share.google/g6XjX1wQQWrooyU6H',
  googleReviewsUrl: 'https://share.google/wvSIFxvInvfh2XGTK',
  googleReviewWriteUrl: 'https://share.google/wvSIFxvInvfh2XGTK',
  address: 'Prédio Medical Center, Folha 26, Quadra 7, Lote 12A, Sala 106 — Nova Marabá/PA',
};

export const DOCTOR = {
  name: 'Dra. Bárbara Naves',
  role: 'Pediatra em Marabá-PA',
  crm: 'CRM-PA 15194',
  rqe: 'RQE 10383',
  headline: 'Cuidado pediátrico com acolhimento, ciência e orientação prática para a família.',
  heroImage: '/assets/images/hero-barbara.jpg',
  aboutImage: '/assets/images/about-barbara.jpg',
  instituteLogo: '/assets/images/logo-instituto.png',
};

// ============ CALENDÁRIO EDITÁVEL DE VACINAÇÃO ============
export const VACCINES: Vaccine[] = [
  { id: 'bcg', name: 'BCG', recommendedAgeMonths: 0, description: 'Proteção contra formas graves de tuberculose.' },
  { id: 'hepb-1', name: 'Hepatite B', recommendedAgeMonths: 0, description: 'Dose ao nascer, conforme calendário vigente.' },
  { id: 'pentavalente-1', name: 'Pentavalente — 1ª dose', recommendedAgeMonths: 2, description: 'Difteria, tétano, coqueluche, hepatite B e Hib.' },
  { id: 'vip-1', name: 'VIP — 1ª dose', recommendedAgeMonths: 2, description: 'Poliomielite.' },
  { id: 'pneumococica-1', name: 'Pneumocócica — 1ª dose', recommendedAgeMonths: 2, description: 'Doenças pneumocócicas.' },
  { id: 'rotavirus-1', name: 'Rotavírus — 1ª dose', recommendedAgeMonths: 2, description: 'Gastroenterite por rotavírus.' },
  { id: 'meningococica-c-1', name: 'Meningocócica C — 1ª dose', recommendedAgeMonths: 3, description: 'Doença meningocócica C.' },
  { id: 'pentavalente-2', name: 'Pentavalente — 2ª dose', recommendedAgeMonths: 4, description: 'Segunda dose do esquema básico.' },
  { id: 'vip-2', name: 'VIP — 2ª dose', recommendedAgeMonths: 4, description: 'Poliomielite.' },
  { id: 'pneumococica-2', name: 'Pneumocócica — 2ª dose', recommendedAgeMonths: 4, description: 'Doenças pneumocócicas.' },
  { id: 'rotavirus-2', name: 'Rotavírus — 2ª dose', recommendedAgeMonths: 4, description: 'Gastroenterite por rotavírus.' },
  { id: 'meningococica-c-2', name: 'Meningocócica C — 2ª dose', recommendedAgeMonths: 5, description: 'Doença meningocócica C.' },
  { id: 'pentavalente-3', name: 'Pentavalente — 3ª dose', recommendedAgeMonths: 6, description: 'Terceira dose do esquema básico.' },
  { id: 'vip-3', name: 'VIP — 3ª dose', recommendedAgeMonths: 6, description: 'Poliomielite.' },
  { id: 'influenza', name: 'Influenza', recommendedAgeMonths: 6, description: 'Vacina anual contra gripe, conforme orientação vigente.' },
  { id: 'febre-amarela', name: 'Febre Amarela', recommendedAgeMonths: 9, description: 'Conforme calendário e região.' },
  { id: 'triplice-viral-1', name: 'Tríplice viral — 1ª dose', recommendedAgeMonths: 12, description: 'Sarampo, caxumba e rubéola.' },
  { id: 'pneumococica-reforco', name: 'Pneumocócica — reforço', recommendedAgeMonths: 12, description: 'Reforço conforme calendário.' },
  { id: 'meningococica-c-reforco', name: 'Meningocócica C — reforço', recommendedAgeMonths: 12, description: 'Reforço conforme calendário.' },
  { id: 'hepatite-a', name: 'Hepatite A', recommendedAgeMonths: 15, description: 'Dose conforme calendário vigente.' },
  { id: 'dtp-reforco', name: 'DTP — reforço', recommendedAgeMonths: 15, description: 'Difteria, tétano e coqueluche.' },
  { id: 'varicela', name: 'Varicela', recommendedAgeMonths: 15, description: 'Catapora.' },
];

// ============ MATERIAIS GRATUITOS ==========
export const MATERIALS: Material[] = [
  {
    id: 'caderneta-menina',
    title: 'Caderneta da Criança — Menina',
    description: 'Documento oficial para acompanhar saúde, crescimento, desenvolvimento, vacinação e consultas.',
    category: 'Caderneta da Criança',
    ageIndicationMonths: { min: 0, max: 108 },
    fileName: '/assets/pdfs/caderneta-crianca-menina.pdf',
    isFree: true,
    createdAt: Date.now(),
  },
  {
    id: 'caderneta-menino',
    title: 'Caderneta da Criança — Menino',
    description: 'Documento oficial para acompanhar saúde, crescimento, desenvolvimento, vacinação e consultas.',
    category: 'Caderneta da Criança',
    ageIndicationMonths: { min: 0, max: 108 },
    fileName: '/assets/pdfs/caderneta-crianca-menino.pdf',
    isFree: true,
    createdAt: Date.now(),
  },
  {
    id: 'consulta-pre-natal-pediatrico',
    title: 'Consulta Pré-Natal Pediátrica',
    description: 'Material para alinhar parto, primeiros cuidados, triagens neonatais, vacinas e amamentação.',
    category: 'Pré-natal pediátrico',
    ageIndicationMonths: { min: 0, max: 0 },
    fileName: '/assets/pdfs/consulta-pre-natal-pediatrico.pdf',
    isFree: true,
    createdAt: Date.now(),
  },
  {
    id: 'introducao-alimentar',
    title: 'Guia de Introdução Alimentar',
    description: 'Orientações iniciais para começar a alimentação complementar com mais segurança.',
    category: 'Introdução alimentar',
    ageIndicationMonths: { min: 6, max: 24 },
    fileName: '/assets/pdfs/guia-introducao-alimentar.pdf',
    isFree: true,
    createdAt: Date.now(),
  },
  {
    id: 'blw-cortes',
    title: 'Guia de Cortes para BLW',
    description: 'Imagens e orientações práticas de cortes para o método Baby-Led Weaning.',
    category: 'BLW',
    ageIndicationMonths: { min: 6, max: 36 },
    fileName: '/assets/pdfs/guia-cortes-blw.pdf',
    isFree: true,
    createdAt: Date.now(),
  },
  {
    id: 'primeiros-sabores',
    title: 'Checklist Primeiros Sabores',
    description: 'Lista para marcar alimentos já experimentados pelo bebê e acompanhar variedade alimentar.',
    category: 'Introdução alimentar',
    ageIndicationMonths: { min: 6, max: 24 },
    fileName: '/assets/pdfs/checklist-primeiros-sabores.pdf',
    isFree: true,
    createdAt: Date.now(),
  },
  {
    id: 'marcos-desenvolvimento',
    title: 'Marcos do Desenvolvimento Infantil',
    description: 'Guia para observar aquisições importantes do desenvolvimento com carinho e atenção.',
    category: 'Desenvolvimento',
    ageIndicationMonths: { min: 0, max: 60 },
    fileName: '/assets/pdfs/marcos-desenvolvimento-infantil.pdf',
    isFree: true,
    createdAt: Date.now(),
  },
  {
    id: 'higiene-bucal',
    title: 'Higiene Bucal do Bebê',
    description: 'Cuidados com boca e dentes desde os primeiros meses.',
    category: 'Saúde bucal',
    ageIndicationMonths: { min: 0, max: 36 },
    fileName: '/assets/pdfs/higiene-bucal-bebe.pdf',
    isFree: true,
    createdAt: Date.now(),
  },
  {
    id: 'sugestoes-cadeiras',
    title: 'Sugestões de Cadeiras de Refeição',
    description: 'Referência de apoio para escolher uma cadeira segura e confortável para a rotina alimentar.',
    category: 'Rotina alimentar',
    ageIndicationMonths: { min: 6, max: 24 },
    fileName: '/assets/pdfs/sugestoes-cadeiras-refeicao.pdf',
    isFree: true,
    createdAt: Date.now(),
  },
  {
    id: 'sugestoes-copos',
    title: 'Sugestões de Copos',
    description: 'Sugestões de copos e utensílios para a transição alimentar da criança.',
    category: 'Rotina alimentar',
    ageIndicationMonths: { min: 6, max: 24 },
    fileName: '/assets/pdfs/sugestoes-copos.pdf',
    isFree: true,
    createdAt: Date.now(),
  },
];

// ============ VÍDEOS ==========
// Integração real: reportagem-babau.mp4 e anemia-sbp.mp4. Verifique se ambos existem em client/public/assets/videos antes do deploy.
export const VIDEOS: Video[] = [
  {
    id: 'reportagem-babau',
    title: 'Participação da Dra. Bárbara na TV',
    description: 'Vídeo real integrado ao app, com participação da Dra. Bárbara em reportagem educativa.',
    category: 'Participações na mídia',
    thumbnailUrl: '/assets/thumbs/thumb-reportagem-babau.jpg',
    videoUrl: '/assets/videos/reportagem-babau.mp4',
    duration: undefined,
    isFeatured: true,
    createdAt: Date.now(),
  },
  {
    id: 'anemia-sbp',
    title: 'Atualização da SBP sobre prevenção da anemia',
    description: 'Vídeo educativo sobre prevenção da anemia, com orientação pediátrica baseada em evidências.',
    category: 'Alimentação e pediatria',
    thumbnailUrl: '/assets/thumbs/thumb-anemia-sbp.jpg',
    videoUrl: '/assets/videos/anemia-sbp.mp4',
    duration: undefined,
    isFeatured: true,
    createdAt: Date.now(),
  },
];

export const GALLERY_ITEMS = [
  {
    id: 'hero-barbara',
    title: 'Dra. Bárbara Naves',
    category: 'Institucional',
    imageUrl: '/assets/images/hero-barbara.jpg',
    description: 'Atendimento pediátrico com acolhimento e orientação prática.',
  },
  {
    id: 'about-barbara',
    title: 'Cuidado pediátrico',
    category: 'Institucional',
    imageUrl: '/assets/images/about-barbara.jpg',
    description: 'Presença profissional e comunicação próxima com famílias.',
  },
  {
    id: 'galeria-1',
    title: 'Consulta pediátrica',
    category: 'Atendimento autorizado',
    imageUrl: '/assets/images/galeria-1.jpg',
    description: 'Ambiente de cuidado infantil e escuta familiar.',
  },
  {
    id: 'galeria-2',
    title: 'Atendimento lúdico',
    category: 'Atendimento autorizado',
    imageUrl: '/assets/images/galeria-2.jpg',
    description: 'Cuidado com leveza, vínculo e confiança.',
  },
  {
    id: 'galeria-3',
    title: 'Famílias atendidas',
    category: 'Atendimento autorizado',
    imageUrl: '/assets/images/galeria-3.jpg',
    description: 'Registro publicado apenas quando houver autorização expressa dos responsáveis.',
  },
];

export const FAQS: FAQ[] = [
  {
    id: 'faq-1',
    question: 'Quando fazer a primeira consulta com o pediatra?',
    answer: 'A primeira avaliação deve ocorrer nos primeiros dias de vida, conforme orientação da maternidade e da família. Ela ajuda a revisar amamentação, ganho de peso, icterícia, triagens neonatais, vacinas e dúvidas dos responsáveis.',
    category: 'Primeira consulta',
    order: 1,
    createdAt: Date.now(),
  },
  {
    id: 'faq-2',
    question: 'Quando iniciar a introdução alimentar?',
    answer: 'Em geral, a introdução alimentar começa por volta dos 6 meses, quando o bebê apresenta sinais de prontidão. A decisão deve considerar desenvolvimento, segurança, rotina familiar e orientação do pediatra.',
    category: 'Introdução alimentar',
    order: 2,
    createdAt: Date.now(),
  },
  {
    id: 'faq-3',
    question: 'Como o app ajuda no aleitamento materno?',
    answer: 'O app permite registrar mamadas, duração, lado utilizado, dor, pega e observações. Esses dados ajudam a família a lembrar da rotina e a levar informações mais organizadas para a consulta.',
    category: 'Amamentação',
    order: 3,
    createdAt: Date.now(),
  },
  {
    id: 'faq-4',
    question: 'O app calcula diagnóstico pela curva de crescimento?',
    answer: 'Não. O app ajuda a registrar medidas e visualizar a evolução. A interpretação clínica da curva de crescimento deve ser feita por pediatra.',
    category: 'Crescimento',
    order: 4,
    createdAt: Date.now(),
  },
  {
    id: 'faq-5',
    question: 'Quando procurar atendimento imediatamente?',
    answer: 'Procure atendimento se houver dificuldade para respirar, prostração importante, febre em bebê pequeno, sinais de desidratação, vômitos persistentes, sangue nas fezes, convulsão ou qualquer piora importante.',
    category: 'Quando procurar emergência',
    order: 5,
    createdAt: Date.now(),
  },
  {
    id: 'faq-6',
    question: 'Posso usar a galeria de pacientes livremente?',
    answer: 'Não. Fotos de crianças e famílias só devem ser publicadas com autorização expressa dos responsáveis, sem identificação desnecessária e sem promessa de resultado.',
    category: 'Privacidade',
    order: 6,
    createdAt: Date.now(),
  },
];

export const REVIEWS: Review[] = [];

export const EDUCATIONAL_MESSAGES = {
  feeding: {
    alarm: 'Dor intensa, dificuldade persistente de pega, pouca urina, sonolência excessiva ou perda de peso devem ser avaliados por profissional de saúde.',
  },
  diaper: {
    alarm: 'Sangue nas fezes, vômitos persistentes, sinais de desidratação, febre associada ou prostração exigem avaliação médica.',
  },
  symptoms: {
    alarm: 'Este app não faz diagnóstico e não analisa imagens. Procure avaliação médica se houver piora, sinais de alarme ou dúvida.',
  },
  growth: {
    caution: 'A curva de crescimento é uma ferramenta de acompanhamento, não um diagnóstico. A interpretação depende do histórico da criança.',
    premature: 'Crianças prematuras podem exigir idade corrigida e avaliação individualizada. Confirme com a pediatra.',
    attention: 'Este ponto merece atenção e deve ser avaliado pela pediatra.',
  },
  digestive: {
    info: 'Esta área é educativa e ajuda a organizar informações para a consulta. Não substitui avaliação médica.',
  },
  storage: {
    info: 'No MVP, os dados ficam salvos neste dispositivo. Você pode apagar os dados a qualquer momento.',
  },
};

export const CATEGORIES = {
  MATERIALS: ['Caderneta da Criança', 'Pré-natal pediátrico', 'Introdução alimentar', 'BLW', 'Sono', 'Desenvolvimento', 'Saúde bucal', 'Rotina alimentar'],
  CONTENT: ['Primeira consulta', 'Vacinas', 'Febre', 'Amamentação', 'Sono', 'Introdução alimentar', 'Recém-nascido', 'Desenvolvimento', 'Saúde digestiva', 'Quando procurar emergência', 'Privacidade'],
};

export const THEME_COLORS = {
  primary: '#D78DAE',
  secondary: '#86B99C',
  accent: '#96BFD7',
  cream: '#FFF8F3',
  roseLight: '#FBE8F0',
  sageLight: '#EAF5EF',
  dark: '#294137',
  light: '#FFFFFF',
};
