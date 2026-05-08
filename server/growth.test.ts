import { describe, it, expect } from 'vitest';

// Funções de validação para crescimento
function validateGrowthInput(weight?: number, height?: number, headCircumference?: number): boolean {
  if (weight !== undefined && (weight < 0.5 || weight > 50)) return false;
  if (height !== undefined && (height < 30 || height > 200)) return false;
  if (headCircumference !== undefined && (headCircumference < 20 || headCircumference > 60)) return false;
  return true;
}

function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

describe('Growth Validation', () => {
  it('validates correct weight', () => {
    expect(validateGrowthInput(3.5, undefined, undefined)).toBe(true);
    expect(validateGrowthInput(5.2, undefined, undefined)).toBe(true);
    expect(validateGrowthInput(10, undefined, undefined)).toBe(true);
  });

  it('rejects invalid weight', () => {
    expect(validateGrowthInput(-1, undefined, undefined)).toBe(false);
    expect(validateGrowthInput(0.2, undefined, undefined)).toBe(false);
    expect(validateGrowthInput(100, undefined, undefined)).toBe(false);
  });

  it('validates correct height', () => {
    expect(validateGrowthInput(undefined, 50, undefined)).toBe(true);
    expect(validateGrowthInput(undefined, 65, undefined)).toBe(true);
    expect(validateGrowthInput(undefined, 100, undefined)).toBe(true);
  });

  it('rejects invalid height', () => {
    expect(validateGrowthInput(undefined, 20, undefined)).toBe(false);
    expect(validateGrowthInput(undefined, 250, undefined)).toBe(false);
  });

  it('validates correct head circumference', () => {
    expect(validateGrowthInput(undefined, undefined, 35)).toBe(true);
    expect(validateGrowthInput(undefined, undefined, 37)).toBe(true);
  });

  it('rejects invalid head circumference', () => {
    expect(validateGrowthInput(undefined, undefined, 10)).toBe(false);
    expect(validateGrowthInput(undefined, undefined, 80)).toBe(false);
  });

  it('calculates BMI correctly', () => {
    const bmi = calculateBMI(70, 175); // 70kg, 175cm
    expect(bmi).toBeCloseTo(22.86, 1);
  });

  it('handles all measurements together', () => {
    expect(validateGrowthInput(5, 65, 37)).toBe(true);
    expect(validateGrowthInput(-1, 65, 37)).toBe(false);
    expect(validateGrowthInput(5, 250, 37)).toBe(false);
    expect(validateGrowthInput(5, 65, 100)).toBe(false);
  });
});
