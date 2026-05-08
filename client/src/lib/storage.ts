/**
 * Camada de armazenamento local usando IndexedDB e localStorage
 * Preparada para futuras integrações com Firebase/Firestore
 * 
 * Estrutura:
 * - IndexedDB: armazena dados complexos (crianças, registros, etc.)
 * - localStorage: armazena preferências e estado da app
 */

import type {
  Child,
  GrowthRecord,
  FeedingSession,
  ExpressedMilkEntry,
  FormulaEntry,
  DiaperEntry,
  SleepEntry,
  SymptomEntry,
  DigestiveConsultationPrep,
  GeneralNote,
  VaccineRecord,
} from '@shared/types';

const DB_NAME = 'CuidarDraBarbara';
const DB_VERSION = 1;

// Nomes das stores
const STORES = {
  CHILDREN: 'children',
  GROWTH_RECORDS: 'growthRecords',
  FEEDING_SESSIONS: 'feedingSessions',
  EXPRESSED_MILK: 'expressedMilk',
  FORMULA_ENTRIES: 'formulaEntries',
  DIAPER_ENTRIES: 'diaperEntries',
  SLEEP_ENTRIES: 'sleepEntries',
  SYMPTOM_ENTRIES: 'symptomEntries',
  DIGESTIVE_PREP: 'digestivePrep',
  GENERAL_NOTES: 'generalNotes',
  VACCINE_RECORDS: 'vaccineRecords',
};

// ============ INICIALIZAÇÃO DO INDEXEDDB ============
let db: IDBDatabase | null = null;

export async function initializeDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Criar stores se não existirem
      Object.values(STORES).forEach((storeName) => {
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };
  });
}

async function getDB(): Promise<IDBDatabase> {
  if (!db) {
    db = await initializeDB();
  }
  return db;
}

// ============ OPERAÇÕES GENÉRICAS ============
async function add<T extends { id: string }>(storeName: string, data: T): Promise<string> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as string);
  });
}

async function put<T extends { id: string }>(storeName: string, data: T): Promise<string> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as string);
  });
}

async function get<T>(storeName: string, id: string): Promise<T | undefined> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T | undefined);
  });
}

async function getAll<T>(storeName: string): Promise<T[]> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T[]);
  });
}

async function delete_(storeName: string, id: string): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function clear(storeName: string): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ============ OPERAÇÕES DE CRIANÇA ============
export async function addChild(child: Child): Promise<string> {
  return add(STORES.CHILDREN, { ...child, createdAt: Date.now(), updatedAt: Date.now() });
}

export async function updateChild(child: Child): Promise<string> {
  return put(STORES.CHILDREN, { ...child, updatedAt: Date.now() });
}

export async function getChild(id: string): Promise<Child | undefined> {
  return get(STORES.CHILDREN, id);
}

export async function getAllChildren(): Promise<Child[]> {
  return getAll(STORES.CHILDREN);
}

export async function deleteChild(id: string): Promise<void> {
  return delete_(STORES.CHILDREN, id);
}

// ============ OPERAÇÕES DE CRESCIMENTO ============
export async function addGrowthRecord(record: GrowthRecord): Promise<string> {
  return add(STORES.GROWTH_RECORDS, { ...record, createdAt: Date.now(), updatedAt: Date.now() });
}

export async function updateGrowthRecord(record: GrowthRecord): Promise<string> {
  return put(STORES.GROWTH_RECORDS, { ...record, updatedAt: Date.now() });
}

export async function getGrowthRecordsForChild(childId: string): Promise<GrowthRecord[]> {
  const records = await getAll<GrowthRecord>(STORES.GROWTH_RECORDS);
  return records.filter((r) => r.childId === childId).sort((a, b) => b.date - a.date);
}

export async function deleteGrowthRecord(id: string): Promise<void> {
  return delete_(STORES.GROWTH_RECORDS, id);
}

// ============ OPERAÇÕES DE ALEITAMENTO ============
export async function addFeedingSession(session: FeedingSession): Promise<string> {
  return add(STORES.FEEDING_SESSIONS, { ...session, createdAt: Date.now(), updatedAt: Date.now() });
}

export async function updateFeedingSession(session: FeedingSession): Promise<string> {
  return put(STORES.FEEDING_SESSIONS, { ...session, updatedAt: Date.now() });
}

export async function getFeedingSessionsForChild(childId: string): Promise<FeedingSession[]> {
  const sessions = await getAll<FeedingSession>(STORES.FEEDING_SESSIONS);
  return sessions.filter((s) => s.childId === childId).sort((a, b) => b.startTime - a.startTime);
}

export async function deleteFeedingSession(id: string): Promise<void> {
  return delete_(STORES.FEEDING_SESSIONS, id);
}

// ============ OPERAÇÕES DE LEITE ORDENHADO ============
export async function addExpressedMilk(entry: ExpressedMilkEntry): Promise<string> {
  return add(STORES.EXPRESSED_MILK, { ...entry, createdAt: Date.now(), updatedAt: Date.now() });
}

export async function getExpressedMilkForChild(childId: string): Promise<ExpressedMilkEntry[]> {
  const entries = await getAll<ExpressedMilkEntry>(STORES.EXPRESSED_MILK);
  return entries.filter((e) => e.childId === childId).sort((a, b) => b.time - a.time);
}

// ============ OPERAÇÕES DE FÓRMULA ============
export async function addFormulaEntry(entry: FormulaEntry): Promise<string> {
  return add(STORES.FORMULA_ENTRIES, { ...entry, createdAt: Date.now(), updatedAt: Date.now() });
}

export async function getFormulaEntriesForChild(childId: string): Promise<FormulaEntry[]> {
  const entries = await getAll<FormulaEntry>(STORES.FORMULA_ENTRIES);
  return entries.filter((e) => e.childId === childId).sort((a, b) => b.time - a.time);
}

// ============ OPERAÇÕES DE FRALDAS ============
export async function addDiaperEntry(entry: DiaperEntry): Promise<string> {
  return add(STORES.DIAPER_ENTRIES, { ...entry, createdAt: Date.now(), updatedAt: Date.now() });
}

export async function getDiaperEntriesForChild(childId: string): Promise<DiaperEntry[]> {
  const entries = await getAll<DiaperEntry>(STORES.DIAPER_ENTRIES);
  return entries.filter((e) => e.childId === childId).sort((a, b) => b.time - a.time);
}

// ============ OPERAÇÕES DE SONO ============
export async function addSleepEntry(entry: SleepEntry): Promise<string> {
  return add(STORES.SLEEP_ENTRIES, { ...entry, createdAt: Date.now(), updatedAt: Date.now() });
}

export async function getSleepEntriesForChild(childId: string): Promise<SleepEntry[]> {
  const entries = await getAll<SleepEntry>(STORES.SLEEP_ENTRIES);
  return entries.filter((e) => e.childId === childId).sort((a, b) => b.startTime - a.startTime);
}

// ============ OPERAÇÕES DE SINTOMAS ============
export async function addSymptomEntry(entry: SymptomEntry): Promise<string> {
  return add(STORES.SYMPTOM_ENTRIES, { ...entry, createdAt: Date.now(), updatedAt: Date.now() });
}

export async function getSymptomEntriesForChild(childId: string): Promise<SymptomEntry[]> {
  const entries = await getAll<SymptomEntry>(STORES.SYMPTOM_ENTRIES);
  return entries.filter((e) => e.childId === childId).sort((a, b) => b.startTime - a.startTime);
}

// ============ OPERAÇÕES DE SAÚDE DIGESTIVA ============
export async function addDigestiveConsultationPrep(prep: DigestiveConsultationPrep): Promise<string> {
  return add(STORES.DIGESTIVE_PREP, { ...prep, createdAt: Date.now(), updatedAt: Date.now() });
}

export async function getDigestiveConsultationPrepsForChild(childId: string): Promise<DigestiveConsultationPrep[]> {
  const preps = await getAll<DigestiveConsultationPrep>(STORES.DIGESTIVE_PREP);
  return preps.filter((p) => p.childId === childId).sort((a, b) => b.date - a.date);
}

// ============ OPERAÇÕES DE OBSERVAÇÕES ============
export async function addGeneralNote(note: GeneralNote): Promise<string> {
  return add(STORES.GENERAL_NOTES, { ...note, createdAt: Date.now(), updatedAt: Date.now() });
}

export async function getGeneralNotesForChild(childId: string): Promise<GeneralNote[]> {
  const notes = await getAll<GeneralNote>(STORES.GENERAL_NOTES);
  return notes.filter((n) => n.childId === childId).sort((a, b) => b.date - a.date);
}

// ============ OPERAÇÕES DE VACINAS ============
export async function addVaccineRecord(record: VaccineRecord): Promise<string> {
  return add(STORES.VACCINE_RECORDS, { ...record, createdAt: Date.now(), updatedAt: Date.now() });
}

export async function updateVaccineRecord(record: VaccineRecord): Promise<string> {
  return put(STORES.VACCINE_RECORDS, { ...record, updatedAt: Date.now() });
}

export async function getVaccineRecordsForChild(childId: string): Promise<VaccineRecord[]> {
  const records = await getAll<VaccineRecord>(STORES.VACCINE_RECORDS);
  return records.filter((r) => r.childId === childId);
}

// ============ OPERAÇÕES DE LIMPEZA ============
export async function clearAllData(): Promise<void> {
  const database = await getDB();
  const transaction = database.transaction(Object.values(STORES), 'readwrite');

  return new Promise((resolve, reject) => {
    Object.values(STORES).forEach((storeName) => {
      const store = transaction.objectStore(storeName);
      store.clear();
    });

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}

// ============ LOCALSTORAGE - PREFERÊNCIAS ============
export const LocalStorageKeys = {
  ACTIVE_CHILD_ID: 'activeChildId',
  THEME: 'theme',
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
  LAST_SYNC: 'lastSync',
};

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Erro ao remover do localStorage:', error);
  }
}
