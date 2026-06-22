import { openDB } from 'idb';

const DB_NAME = 'job-tracker-db';
const DB_VERSION = 2;

export const COLUMNS = [
  { id: 'wishlist', label: 'Wishlist', color: 'border-gray-400' },
  { id: 'applied', label: 'Applied', color: 'border-blue-500' },
  { id: 'follow-up', label: 'Follow-up', color: 'border-yellow-500' },
  { id: 'interview', label: 'Interview', color: 'border-purple-500' },
  { id: 'offer', label: 'Offer', color: 'border-green-500' },
  { id: 'rejected', label: 'Rejected', color: 'border-red-500' },
];

export const ROUND_TYPES = [
  'HR Screen',
  'Technical',
  'System Design',
  'Behavioral',
  'Bar Raiser',
  'Coding Challenge',
  'Final Round',
  'Custom',
];

export const ROUND_STATUS = [
  { id: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  { id: 'passed', label: 'Passed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { id: 'failed', label: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
];

const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains('jobs')) {
        const store = db.createObjectStore('jobs', { keyPath: 'id', autoIncrement: true });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('company', 'company', { unique: false });
      }
      if (oldVersion < 2) {
        // migration handled lazily by default values in app
      }
    },
  });
};

export async function getAllJobs() {
  const db = await initDB();
  return db.getAll('jobs');
}

export async function addJob(job) {
  const db = await initDB();
  const payload = {
    ...job,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interviewRounds: job.interviewRounds || [],
  };
  const id = await db.add('jobs', payload);
  return { ...payload, id };
}

export async function updateJob(job) {
  const db = await initDB();
  const payload = { ...job, updatedAt: new Date().toISOString() };
  await db.put('jobs', payload);
  return payload;
}

export async function deleteJob(id) {
  const db = await initDB();
  await db.delete('jobs', id);
}

export async function getResumes() {
  const jobs = await getAllJobs();
  const resumes = new Set();
  jobs.forEach((j) => {
    if (j.resume) resumes.add(j.resume);
  });
  return Array.from(resumes);
}
