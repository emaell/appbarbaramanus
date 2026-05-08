import type { GrowthRecord, Sex } from '@shared/types';

export type GrowthMetric = 'weight' | 'stature' | 'bmi' | 'headCircumference';
export type GrowthAgeRange = '0-2' | '2-5' | '5-10';

export const Z_SCORE_LINES = [-3, -2, -1, 0, 1, 2, 3] as const;

export interface OfficialGrowthCurvePoint {
  ageMonths: number;
  zMinus3: number;
  zMinus2: number;
  zMinus1: number;
  z0: number;
  zPlus1: number;
  zPlus2: number;
  zPlus3: number;
}

export interface OfficialGrowthCurveDefinition {
  key: string;
  sex: Sex;
  metric: GrowthMetric;
  ageRange: GrowthAgeRange;
  label: string;
  unit: string;
  points: OfficialGrowthCurvePoint[];
  hasOfficialDataset: boolean;
}

/**
 * Estrutura para receber as tabelas oficiais OMS/MS.
 * Não inserir valores aproximados: preencher apenas com dataset oficial conferido.
 *
 * Chaves esperadas:
 * female:weight:0-2, male:weight:0-2
 * female:stature:0-2, male:stature:0-2
 * female:bmi:0-2, male:bmi:0-2
 * female:headCircumference:0-2, male:headCircumference:0-2
 * female:weight:2-5, male:weight:2-5
 * female:stature:2-5, male:stature:2-5
 * female:bmi:2-5, male:bmi:2-5
 * female:weight:5-10, male:weight:5-10
 * female:stature:5-10, male:stature:5-10
 * female:bmi:5-10, male:bmi:5-10
 */
export const OFFICIAL_WHO_GROWTH_CURVES: Record<string, OfficialGrowthCurvePoint[]> = {};

export function calculateAgeInMonths(dateOfBirth: number, measurementDate: number) {
  const birth = new Date(dateOfBirth);
  const measured = new Date(measurementDate);
  let months = (measured.getFullYear() - birth.getFullYear()) * 12 + (measured.getMonth() - birth.getMonth());
  if (measured.getDate() < birth.getDate()) months -= 1;
  return Math.max(0, months);
}

export function calculateBMI(weightKg?: number, statureCm?: number) {
  if (!weightKg || !statureCm) return undefined;
  const meters = statureCm / 100;
  return Number((weightKg / (meters * meters)).toFixed(2));
}

export function getStature(record: GrowthRecord) {
  return record.length ?? record.height;
}

export function getMeasuredValue(record: GrowthRecord, metric: GrowthMetric) {
  if (metric === 'weight') return record.weight;
  if (metric === 'stature') return getStature(record);
  if (metric === 'headCircumference') return record.headCircumference;
  return calculateBMI(record.weight, getStature(record));
}

export function getAgeRange(ageMonths: number): GrowthAgeRange {
  if (ageMonths <= 24) return '0-2';
  if (ageMonths <= 60) return '2-5';
  return '5-10';
}

export function getGrowthMetricLabel(metric: GrowthMetric, ageMonths: number) {
  if (metric === 'weight') return 'Peso para idade';
  if (metric === 'stature') return ageMonths <= 24 ? 'Comprimento para idade' : 'Estatura para idade';
  if (metric === 'bmi') return 'IMC para idade';
  return 'Perímetro cefálico para idade';
}

export function getGrowthMetricUnit(metric: GrowthMetric) {
  if (metric === 'weight') return 'kg';
  if (metric === 'bmi') return 'kg/m²';
  return 'cm';
}

export function getGrowthCurveDefinition(sex: Sex, metric: GrowthMetric, ageMonths: number): OfficialGrowthCurveDefinition {
  const ageRange = metric === 'headCircumference' ? '0-2' : getAgeRange(ageMonths);
  const key = `${sex}:${metric}:${ageRange}`;
  const points = OFFICIAL_WHO_GROWTH_CURVES[key] ?? [];

  return {
    key,
    sex,
    metric,
    ageRange,
    label: getGrowthMetricLabel(metric, ageMonths),
    unit: getGrowthMetricUnit(metric),
    points,
    hasOfficialDataset: points.length > 0,
  };
}

export function getCautiousClassification() {
  return 'Sem classificação automática segura. Acompanhe com o pediatra para interpretação adequada.';
}

export function getZScoreDataKey(zScore: number) {
  if (zScore === -3) return 'zMinus3';
  if (zScore === -2) return 'zMinus2';
  if (zScore === -1) return 'zMinus1';
  if (zScore === 0) return 'z0';
  if (zScore === 1) return 'zPlus1';
  if (zScore === 2) return 'zPlus2';
  return 'zPlus3';
}
