/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// ============ TIPOS DO CUIDAR COM DRA. BÁRBARA ============

// Criança
export type FeedingType = 'breastfeeding' | 'formula' | 'mixed';
export type Sex = 'male' | 'female';
export type MeasurementPosition = 'lying' | 'standing';
export type MeasurementLocation = 'home' | 'consultation' | 'vaccine' | 'other';

export interface Child {
  id: string;
  name: string;
  dateOfBirth: number; // timestamp em ms
  sex: Sex;
  premature: boolean;
  gestationalAgeAtBirth?: number; // semanas
  weightAtBirth?: number; // kg
  lengthAtBirth?: number; // cm
  headCircumferenceAtBirth?: number; // cm
  feedingType: FeedingType;
  parentName?: string;
  city?: string;
  state?: string;
  createdAt: number;
  updatedAt: number;
}

// Crescimento
export interface GrowthRecord {
  id: string;
  childId: string;
  date: number; // timestamp em ms
  weight?: number; // kg
  length?: number; // cm (deitado/comprimento)
  height?: number; // cm (em pé/altura)
  headCircumference?: number; // cm
  position: MeasurementPosition;
  location: MeasurementLocation;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// Aleitamento
export type PegQuality = 'good' | 'difficult' | 'painful' | 'unknown';
export type Satisfaction = 'yes' | 'no' | 'unknown';

export interface FeedingSession {
  id: string;
  childId: string;
  date: number; // timestamp em ms
  startTime: number; // timestamp em ms
  endTime?: number; // timestamp em ms
  durationMinutes?: number;
  rightBreast: boolean;
  leftBreast: boolean;
  pegQuality: PegQuality;
  maternalPain: boolean;
  babyContent: Satisfaction;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ExpressedMilkEntry {
  id: string;
  childId: string;
  date: number; // timestamp em ms
  time: number; // timestamp em ms
  volumeMl: number;
  offeringMethod?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FormulaEntry {
  id: string;
  childId: string;
  date: number; // timestamp em ms
  time: number; // timestamp em ms
  volumeMl: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// Fraldas
export type DiaperType = 'wet' | 'poop' | 'both';
export type StoolAppearance = 'yellow' | 'greenish' | 'brown' | 'hard' | 'liquid' | 'mucus' | 'blood' | 'other';

export interface DiaperEntry {
  id: string;
  childId: string;
  date: number; // timestamp em ms
  time: number; // timestamp em ms
  type: DiaperType;
  stoolAppearance?: StoolAppearance[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// Sono
export interface SleepEntry {
  id: string;
  childId: string;
  date: number; // timestamp em ms
  startTime: number; // timestamp em ms
  endTime: number; // timestamp em ms
  awakenings: number;
  naps: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// Sintomas
export type SymptomType = 'fever' | 'cough' | 'vomit' | 'diarrhea' | 'abdominalPain' | 'colic' | 'reflux' | 'constipation' | 'pickiness' | 'irritability' | 'rash' | 'other';
export type IntensityLevel = 'mild' | 'moderate' | 'severe';

export interface SymptomEntry {
  id: string;
  childId: string;
  date: number; // timestamp em ms
  startTime: number; // timestamp em ms
  symptomType: SymptomType;
  duration?: number; // em minutos
  intensity: IntensityLevel;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// Saúde Digestiva / Gastro
export interface DigestiveConsultationPrep {
  id: string;
  childId: string;
  date: number; // timestamp em ms
  mainComplaint: string;
  durationDays: number;
  bowelFrequency: string;
  stoolConsistency: string;
  hasBloodOrMucus: boolean;
  vomitingFrequency?: string;
  refluxFrequency?: string;
  abdominalPainFrequency?: string;
  perceivedWeightLoss: boolean;
  associatedFoods?: string;
  previousExams?: string;
  currentMedications?: string;
  additionalNotes?: string;
  createdAt: number;
  updatedAt: number;
}

// Observações
export interface GeneralNote {
  id: string;
  childId: string;
  date: number; // timestamp em ms
  content: string;
  createdAt: number;
  updatedAt: number;
}

// Vacinas
export type VaccineStatus = 'pending' | 'completed' | 'late' | 'scheduled';

export interface Vaccine {
  id: string;
  name: string;
  recommendedAgeMonths: number;
  description?: string;
}

export interface VaccineRecord {
  id: string;
  childId: string;
  vaccineId: string;
  status: VaccineStatus;
  suggestedDate?: number; // timestamp em ms
  appliedDate?: number; // timestamp em ms
  location?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// Conteúdos
export interface Material {
  id: string;
  title: string;
  description: string;
  category: string;
  ageIndicationMonths?: { min: number; max: number };
  fileUrl?: string; // URL para PDF ou arquivo
  fileName?: string;
  isFree: boolean;
  createdAt: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnailUrl?: string;
  videoUrl?: string; // YouTube, Instagram, ou upload futuro
  duration?: number; // segundos
  isFeatured: boolean;
  createdAt: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  createdAt: number;
}

// Avaliações
export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5
  text: string;
  date: number; // timestamp em ms
  verified: boolean;
}

// Contexto de Aplicação
export interface AppState {
  activeChildId: string | null;
  children: Child[];
  lastUpdated: number;
}

// Resumo para Exportação
export interface ChildSummaryForExport {
  child: Child;
  growthRecords: GrowthRecord[];
  feedingSessions: FeedingSession[];
  expressedMilk: ExpressedMilkEntry[];
  formula: FormulaEntry[];
  diapers: DiaperEntry[];
  sleep: SleepEntry[];
  symptoms: SymptomEntry[];
  vaccines: VaccineRecord[];
  notes: GeneralNote[];
  exportDate: number;
}
