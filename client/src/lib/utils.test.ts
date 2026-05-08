import { describe, it, expect } from 'vitest';

// Função auxiliar para cálculo de idade
function calculateAge(dateOfBirth: Date): { months: number; days: number; weeks: number } {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  let months = today.getMonth() - birthDate.getMonth();
  let years = today.getFullYear() - birthDate.getFullYear();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  let days = today.getDate() - birthDate.getDate();
  if (days < 0) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }
  
  const totalDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  
  return {
    months: years * 12 + months,
    days: totalDays,
    weeks: weeks
  };
}

describe('Age Calculation', () => {
  it('calculates age correctly for newborn', () => {
    const today = new Date();
    const age = calculateAge(today);
    
    expect(age.months).toBe(0);
    expect(age.days).toBe(0);
    expect(age.weeks).toBe(0);
  });

  it('calculates age correctly for 3 months old', () => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const age = calculateAge(threeMonthsAgo);
    
    expect(age.months).toBeGreaterThanOrEqual(2);
    expect(age.months).toBeLessThanOrEqual(3);
  });

  it('calculates age correctly for 1 year old', () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const age = calculateAge(oneYearAgo);
    
    expect(age.months).toBeGreaterThanOrEqual(11);
    expect(age.months).toBeLessThanOrEqual(13);
  });

  it('calculates weeks correctly', () => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const age = calculateAge(twoWeeksAgo);
    
    expect(age.weeks).toBe(2);
  });
});
