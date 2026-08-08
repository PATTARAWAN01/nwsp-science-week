import { 
  Activity, 
  Registration, 
  CompetitionResult, 
  CertificateConfig,
  CertNumberConfig
} from '../types';
import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';

const STORAGE_KEYS = {
  ACTIVITIES: 'nwsp_science_activities_v2',
  REGISTRATIONS: 'nwsp_science_registrations_v2',
  RESULTS: 'nwsp_science_results_v2',
  CERT_CONFIGS: 'nwsp_science_cert_configs_v2',
  CURRENT_YEAR: 'nwsp_science_current_year',
  ADMIN_AUTH: 'nwsp_science_admin_auth'
};

// Seed 7 Initial Activities for Science Week 2026
export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-quiz-2569',
    academicYear: '2569',
    title: 'การแข่งขันตอบปัญหาวิทยาศาสตร์',
    type: 'team',
    teamSize: 3,
    teachers: ['นางจงกลณี โฮซิน', 'นางนรัญญา ไชยราช', 'นางลีราภรณ์ ชัยคีรี', 'นายณัฐกิจ คำภูธร'],
    levels: ['ม.ต้น', 'ม.ปลาย'],
    details: 'ม.ต้น ตอบปัญหาครอบคลุมเนื้อหาวิทยาศาสตร์ ม.1-3 (ปรนัย 30 ข้อ 30 นาที, อัตนัย 10 ข้อ 20 นาที)\nม.ปลาย ตอบปัญหาครอบคลุมเนื้อหาวิทยาศาสตร์ชีวภาพ-กายภาพ ฟิสิกส์ เคมี ชีววิทยา และโลกดาราศาสตร์และอวกาศ ม.4-6',
    rules: '• สมัครแบบทีม ทีมละ 3 คน (สามารถคละห้องและระดับชั้นได้ในแต่ละช่วงชั้น)\n• ห้ามใช้โทรศัพท์หรืออุปกรณ์อิเล็กทรอนิกส์ขณะแข่งขัน\n• ส่งกระดาษคำตอบเมื่อหมดเวลา\n• การตัดสินของคณะกรรมการถือเป็นที่สิ้นสุด จะอุทธรณ์มิได้',
    awardsText: 'รางวัลที่ 1-3 รับเกียรติบัตรพร้อมของรางวัล และนักเรียนที่เข้าร่วมกิจกรรมจะได้รับเกียรติบัตรในระบบออนไลน์ทุกคน',
    order: 1,
    schedules: {
      junior: { date: '10 สิงหาคม 2569', time: '12.00 - 13.00 น.', location: 'ห้องปฏิบัติการเคมี 314' },
      senior: { date: '11 สิงหาคม 2569', time: '12.00 - 13.00 น.', location: 'ห้องปฏิบัติการเคมี 314' }
    },
    isOpen: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'act-problem-solving-2569',
    academicYear: '2569',
    title: 'การแข่งขันกระบวนการแก้ปัญหาทางวิทยาศาสตร์',
    type: 'team',
    teamSize: 3,
    teachers: ['นายธีรพงษ์ วงค์จำปา', 'นางสาวภัชรา บุญไชย', 'นายณัฐกิจ คำภูธร'],
    levels: ['ม.ต้น', 'ม.ปลาย'],
    details: 'ม.ต้น หัวข้อ "คิดอย่างนักวิทย์ พิชิตปัญหาด้วยมือเรา" (2 ภารกิจ: วิเคราะห์ประดิษฐ์ชิ้นงานแรงดันอากาศ/อุณหภูมิ และแยกสารผสม)\nม.ปลาย หัวข้อ "นักวิทย์รุ่นใหญ่ ไอเดียสร้างสรรค์ ท้าทดลอง" (3 ภารกิจ: ยิงถ้วยกระดาษด้วยแรงดันอากาศ, ส้อมสมดุล, ภารกิจพิทักษ์ไข่)',
    rules: '• คณะกรรมการประเมินจากผลงานแต่ละภารกิจ (ฐานละ 15-20 นาที)\n• วัสดุอุปกรณ์จัดเตรียมโดยผู้จัดการแข่งขัน (ไม่รับสมัครหน้างาน)\n• ทีมที่มาหลังเวลา 12.10 น. จะถูกตัดสิทธิการแข่งขัน\n• การตัดสินของคณะกรรมการถือเป็นที่สิ้นสุด',
    awardsText: 'รางวัลที่ 1-3 รับเกียรติบัตรพร้อมของรางวัล และผู้เข้าร่วมรับเกียรติบัตรในระบบออนไลน์ทุกคน',
    order: 2,
    schedules: {
      junior: { date: '13 สิงหาคม 2569', time: '12.00 - 13.00 น.', location: 'ห้องประชุมปาริชาติ' },
      senior: { date: '14 สิงหาคม 2569', time: '12.00 - 13.00 น.', location: 'ห้องประชุมปาริชาติ' }
    },
    isOpen: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'act-drawing-2569',
    academicYear: '2569',
    title: 'การแข่งขันวาดภาพทางวิทยาศาสตร์',
    type: 'individual',
    teamSize: 1,
    teachers: ['นายขวัญใจ โถบำรุง'],
    levels: ['ม.ต้น', 'ม.ปลาย'],
    details: 'วาดภาพระบายสีสอดคล้องกับคำขวัญวันวิทยาศาสตร์ ประจำปี 2569 ลงกระดาษ 100 ปอนด์ที่กรรมการจัดเตรียมไว้ให้\nม.ต้น ใช้สีไม้/สีดินสอ | ม.ปลาย ใช้สีน้ำ/โปสเตอร์/อะคริลิก ฯลฯ (ให้ผู้แข่งขันเตรียมสีมาเอง)',
    rules: '• เกณฑ์การตัดสิน: แนวคิด (จินตนาการ) 25 คะแนน, รูปแบบความสวยงาม 25 คะแนน, เนื้อหาวิทยาศาสตร์ 30 คะแนน, เทคนิค 20 คะแนน (รวม 100 คะแนน)\n• การตัดสินของคณะกรรมการถือเป็นที่สิ้นสุด',
    awardsText: 'รางวัลที่ 1-3 รับเกียรติบัตรพร้อมของรางวัล และผู้เข้าร่วมรับเกียรติบัตรในระบบออนไลน์ทุกคน',
    order: 3,
    schedules: {
      general: { date: '14 สิงหาคม 2569', time: '13.00 - 15.00 น.', location: 'หอประชุมธรรมจรรยา' }
    },
    isOpen: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'act-comp-quiz-2569',
    academicYear: '2569',
    title: 'การแข่งขันการตอบปัญหาคอมพิวเตอร์และเทคโนโลยี',
    type: 'team',
    teamSize: 2,
    teachers: ['นางสาวภาวินี อ้วนศรีเมือง', 'นางสาวอมรรัตน์ ศรมยุรา', 'นายสนธยา หมู่หัวนา', 'นางสาวภัทราวรรณ สุวรรณวาปี'],
    levels: ['ม.ต้น', 'ม.ปลาย'],
    details: 'การแข่งขันตอบปัญหาความรู้ทางคอมพิวเตอร์และเทคโนโลยีสารสนเทศผ่าน Kahoot จำนวน 20 ข้อ วัดความแม่นยำและความเร็ว',
    rules: '• สมัครเป็นทีม ทีมละ 2 คน (คละห้องได้ ใน 1 ห้องสมัครได้ไม่จำกัดทีม)\n• ให้นักเรียนนำโทรศัพท์มือถือ 1 เครื่องต่อทีมเข้าร่วมแข่งขัน\n• ทีมที่ได้คะแนนสูงสุดรับรางวัลชนะเลิศตามลำดับ',
    awardsText: 'รางวัลที่ 1-3 รับเกียรติบัตรพร้อมของรางวัล และผู้เข้าร่วมรับเกียรติบัตรออนไลน์ทุกคน',
    order: 4,
    schedules: {
      junior: { date: '11 สิงหาคม 2569', time: '12.00 - 12.30 น.', location: 'ห้องคอม 2 อาคาร 4' },
      senior: { date: '11 สิงหาคม 2569', time: '12.30 - 13.00 น.', location: 'ห้องคอม 2 อาคาร 4' }
    },
    isOpen: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'act-infographic-2569',
    academicYear: '2569',
    title: 'การแข่งขันการออกแบบภาพอินโฟกราฟิก',
    type: 'team',
    teamSize: 2,
    teachers: ['นางสาวภาวินี อ้วนศรีเมือง', 'นางสาวอมรรัตน์ ศรมยุรา', 'นายสนธยา หมู่หัวนา', 'นางสาวภัทราวรรณ สุวรรณวาปี'],
    levels: ['ม.ต้น', 'ม.ปลาย'],
    details: 'ออกแบบภาพอินโฟกราฟิกตามหัวข้อที่กรรมการกำหนดในวันแข่งขัน สามารถใช้ มือถือ, Tablet, iPad หรือคอมพิวเตอร์ของโรงเรียนได้',
    rules: '• สมัครเป็นทีม ทีมละ 2 คน (คละห้องได้)\n• เกณฑ์ตัดสิน: ความสมบูรณ์ของผลงาน, ความสอดคล้องกับเนื้อหา, ความตรงต่อเวลา, ความคิดสร้างสรรค์ และการส่งออกไฟล์ที่สมบูรณ์',
    awardsText: 'รางวัลที่ 1-3 รับเกียรติบัตรพร้อมของรางวัล และผู้เข้าร่วมรับเกียรติบัตรออนไลน์ทุกคน',
    order: 5,
    schedules: {
      junior: { date: '18 สิงหาคม 2569', time: '12.00 - 13.00 น.', location: 'ห้องคอม 1 อาคาร 4' },
      senior: { date: '18 สิงหาคม 2569', time: '12.00 - 13.00 น.', location: 'ห้องคอม 2 อาคาร 4' }
    },
    isOpen: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'act-water-rocket-2569',
    academicYear: '2569',
    title: 'การแข่งขันจรวดขวดน้ำ',
    type: 'team',
    teamSize: 3, // Allow up to 3 (1-3)
    teachers: ['นายถาวร ศรีบุญเรือง'],
    levels: ['ม.ต้น', 'ม.ปลาย'],
    details: 'การแข่งขันจรวดขวดน้ำประเภทแม่นยำ ระยะห่างเป้าหมาย 70 เมตร ขับดันด้วยแรงดันน้ำและอากาศ ใช้ขวดน้ำอัดลมไม่เกิน 1.25 ลิตร',
    rules: '• สมัครทีมละ 1-3 คน (ปล่อยจรวดได้ทีมละ 2 รอบ บันทึกสถิติดีที่สุด ตกในรัศมีวงกลม 5 เมตร)\n• ใช้น้ำที่คณะกรรมการจัดเตรียมให้ (เติมน้ำอย่างน้อย 50 cc ห้ามผสมสารอื่น)\n• ติดตั้งฐานปล่อยและปล่อยจรวดให้เสร็จภายในเวลา 3 นาที',
    awardsText: 'รางวัลที่ 1-3 รับเกียรติบัตรพร้อมของรางวัล และผู้เข้าร่วมรับเกียรติบัตรออนไลน์ทุกคน',
    schedules: {
      general: { date: '13 สิงหาคม 2569', time: '13.00 น. เป็นต้นไป', location: 'สนามฟุตบอล' }
    },
    isOpen: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'act-recycle-fashion-2569',
    academicYear: '2569',
    title: 'การแข่งขันชุดรีไซเคิล',
    type: 'individual',
    teamSize: 1,
    teachers: ['นายธีรพงษ์ วงค์จำปา'],
    levels: ['ม.ต้น', 'ม.ปลาย'],
    details: 'ประดิษฐ์ชุดใหม่จากวัสดุเหลือใช้ สวมใส่ได้จริง คงทนตลอดการแข่งขัน และสามารถนำเสนออธิบายแนวคิดจัดทำชุดได้',
    rules: '• สมัครเดี่ยว (1 คน) แบ่งการตัดสินแยก ม.ต้น และ ม.ปลาย\n• ผู้เข้าแข่งขันต้องมารายงานตัวตรงเวลา หากมาช้าจะถูกตัดสิทธิ์\n• การตัดสินของคณะกรรมการถือเป็นที่สิ้นสุด',
    awardsText: 'รางวัลที่ 1-3 รับเกียรติบัตรพร้อมของรางวัล และผู้เข้าร่วมรับเกียรติบัตรออนไลน์ทุกคน',
    schedules: {
      general: { date: '20 สิงหาคม 2569', time: '09.00 - 12.00 น.', location: 'หอประชุมธรรมจรรยา' }
    },
    isOpen: true,
    createdAt: new Date().toISOString()
  }
];

// Seed Registrations (Empty for production)
export const INITIAL_REGISTRATIONS: Registration[] = [];

// Seed Competition Results (Empty for production)
export const INITIAL_RESULTS: CompetitionResult[] = [];

// Helper for timeout-protected Firestore queries
const fetchWithTimeout = async <T>(promise: Promise<T>, timeoutMs = 1500): Promise<T> => {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Firestore query timeout")), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
};

// Helper to get item from LocalStorage or default
const getLocal = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from LocalStorage:`, err);
    return fallback;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to LocalStorage:`, err);
  }
};

// Helper to sanitize objects for Cloud Firestore (strips undefined values)
const cleanForFirestore = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// --- Storage API Service --- //

export const getAcademicYear = (): string => {
  return getLocal<string>(STORAGE_KEYS.CURRENT_YEAR, '2569');
};

export const setAcademicYear = async (year: string): Promise<void> => {
  setLocal<string>(STORAGE_KEYS.CURRENT_YEAR, year);
};

// Get Activities (3-Way Merge: Baseline Templates + LocalStorage + Cloud Firestore)
export const getActivities = async (year?: string): Promise<Activity[]> => {
  const targetYear = year || getAcademicYear();
  
  // 1. Initialize Baseline Activities for target year
  let baseActivities: Activity[] = targetYear === '2569'
    ? INITIAL_ACTIVITIES
    : INITIAL_ACTIVITIES.map(baseAct => ({
        ...baseAct,
        id: `${baseAct.id}-${targetYear}`,
        academicYear: targetYear,
        isOpen: true,
        createdAt: new Date().toISOString()
      }));

  const activityMap = new Map<string, Activity>();
  baseActivities.forEach(act => activityMap.set(act.id, act));

  // 2. Overlay LocalStorage edits
  const localList = getLocal<Activity[]>(STORAGE_KEYS.ACTIVITIES, []);
  localList.filter(act => act.academicYear === targetYear).forEach(act => {
    activityMap.set(act.id, act);
  });

  // 3. Overlay Cloud Firestore updates
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'activities'), where('academicYear', '==', targetYear));
      const querySnapshot = await fetchWithTimeout(getDocs(q), 2500);
      querySnapshot.forEach((docSnap) => {
        const cloudAct = docSnap.data() as Activity;
        if (cloudAct && cloudAct.id) {
          activityMap.set(cloudAct.id, cloudAct);
        }
      });
    } catch (err) {
      console.warn("Firestore fetch activities warning:", err);
    }
  }

  const mergedActivities = Array.from(activityMap.values());
  // Sort activities by explicit order (1, 2, 3...)
  mergedActivities.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  setLocal<Activity[]>(STORAGE_KEYS.ACTIVITIES, mergedActivities);
  return mergedActivities;
};

export const saveActivity = async (activity: Activity): Promise<void> => {
  // Update Local Storage immediately for 0ms UI reactivity
  const list = getLocal<Activity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  const idx = list.findIndex(a => a.id === activity.id);
  if (idx >= 0) {
    list[idx] = activity;
  } else {
    list.unshift(activity);
  }
  setLocal(STORAGE_KEYS.ACTIVITIES, list);

  // Sync to Cloud Firestore (sanitized for Firestore)
  if (isFirebaseConfigured() && db) {
    try {
      const cleanData = cleanForFirestore(activity);
      await setDoc(doc(db, 'activities', activity.id), cleanData);
    } catch (err) {
      console.error("Firestore save activity failed:", err);
    }
  }
};

export const deleteActivity = async (id: string): Promise<void> => {
  const list = getLocal<Activity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  const updated = list.filter(a => a.id !== id);
  setLocal(STORAGE_KEYS.ACTIVITIES, updated);

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'activities', id));
    } catch (err) {
      console.error("Firestore delete activity failed:", err);
    }
  }
};

// Helper to sanitize registration member grade alignment
const sanitizeRegistrationGrade = (r: Registration): Registration => {
  if (!r || !r.members) return r;
  const isJunior = r.level === 'ม.ต้น';
  const sanitizedMembers = r.members.map(m => {
    const isJuniorGrade = ['ม.1', 'ม.2', 'ม.3'].includes(m.grade);
    let g = m.grade;
    if (!isJunior && isJuniorGrade) {
      g = 'ม.4';
    } else if (isJunior && !isJuniorGrade) {
      g = 'ม.1';
    }
    return { ...m, grade: g as any };
  });
  return { ...r, members: sanitizedMembers };
};

// Registrations API
export const getRegistrations = async (year?: string): Promise<Registration[]> => {
  const targetYear = year || getAcademicYear();
  const regMap = new Map<string, Registration>();

  // 1. LocalStorage registrations
  const localList = getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
  localList.filter(r => r.academicYear === targetYear).forEach(r => regMap.set(r.id, sanitizeRegistrationGrade(r)));

  // 2. Cloud Firestore registrations
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'registrations'), where('academicYear', '==', targetYear));
      const querySnapshot = await fetchWithTimeout(getDocs(q), 2500);
      querySnapshot.forEach((docSnap) => {
        const cloudReg = docSnap.data() as Registration;
        if (cloudReg && cloudReg.id) {
          regMap.set(cloudReg.id, sanitizeRegistrationGrade(cloudReg));
        }
      });
    } catch (err) {
      console.warn("Firestore fetch registrations warning:", err);
    }
  }

  const merged = Array.from(regMap.values());
  return merged;
};

export const saveRegistration = async (registration: Registration): Promise<void> => {
  const list = getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
  const idx = list.findIndex(r => r.id === registration.id);
  if (idx >= 0) {
    list[idx] = registration;
  } else {
    list.unshift(registration);
  }
  setLocal(STORAGE_KEYS.REGISTRATIONS, list);

  if (isFirebaseConfigured() && db) {
    try {
      const cleanData = cleanForFirestore(registration);
      await setDoc(doc(db, 'registrations', registration.id), cleanData);
    } catch (err) {
      console.error("Firestore save registration failed:", err);
    }
  }
};

export const deleteRegistration = async (id: string): Promise<void> => {
  const list = getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
  const updated = list.filter(r => r.id !== id);
  setLocal(STORAGE_KEYS.REGISTRATIONS, updated);

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'registrations', id));
    } catch (err) {
      console.error("Firestore delete registration failed:", err);
    }
  }
};

// Results API
export const getResults = async (year?: string): Promise<CompetitionResult[]> => {
  const targetYear = year || getAcademicYear();
  const resMap = new Map<string, CompetitionResult>();

  // 1. LocalStorage results
  const localList = getLocal<CompetitionResult[]>(STORAGE_KEYS.RESULTS, []);
  localList.filter(r => r.academicYear === targetYear).forEach(r => resMap.set(r.id, r));

  // 2. Cloud Firestore results
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'results'), where('academicYear', '==', targetYear));
      const querySnapshot = await fetchWithTimeout(getDocs(q), 2500);
      querySnapshot.forEach((docSnap) => {
        const cloudRes = docSnap.data() as CompetitionResult;
        if (cloudRes && cloudRes.id) {
          resMap.set(cloudRes.id, cloudRes);
        }
      });
    } catch (err) {
      console.warn("Firestore fetch results warning:", err);
    }
  }

  const merged = Array.from(resMap.values());
  return merged;
};

export const saveResult = async (result: CompetitionResult): Promise<void> => {
  const list = getLocal<CompetitionResult[]>(STORAGE_KEYS.RESULTS, []);
  const idx = list.findIndex(r => r.id === result.id);
  if (idx >= 0) {
    list[idx] = result;
  } else {
    list.unshift(result);
  }
  setLocal(STORAGE_KEYS.RESULTS, list);

  if (isFirebaseConfigured() && db) {
    try {
      const cleanData = cleanForFirestore(result);
      await setDoc(doc(db, 'results', result.id), cleanData);
    } catch (err) {
      console.error("Firestore save result failed:", err);
    }
  }
};

export const deleteResult = async (id: string): Promise<void> => {
  const list = getLocal<CompetitionResult[]>(STORAGE_KEYS.RESULTS, []);
  const updated = list.filter(r => r.id !== id);
  setLocal(STORAGE_KEYS.RESULTS, updated);

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'results', id));
    } catch (err) {
      console.error("Firestore delete result failed:", err);
    }
  }
};

// Certificate Config API (3-Way Merge: LocalStorage + Cloud Firestore)
export const getCertificateConfigs = async (): Promise<CertificateConfig[]> => {
  const configMap = new Map<string, CertificateConfig>();

  // 1. Local Storage
  const localList = getLocal<CertificateConfig[]>(STORAGE_KEYS.CERT_CONFIGS, []);
  localList.forEach(c => {
    const key = `${c.activityId}-${c.level}-${c.academicYear}`;
    configMap.set(key, c);
  });

  // 2. Cloud Firestore
  if (isFirebaseConfigured() && db) {
    try {
      const querySnapshot = await fetchWithTimeout(getDocs(collection(db, 'certificate_configs')), 2500);
      querySnapshot.forEach((docSnap) => {
        const cloudConfig = docSnap.data() as CertificateConfig;
        if (cloudConfig && cloudConfig.activityId) {
          const key = `${cloudConfig.activityId}-${cloudConfig.level}-${cloudConfig.academicYear}`;
          configMap.set(key, cloudConfig);
        }
      });
    } catch (err) {
      console.warn("Firestore fetch certificate configs warning:", err);
    }
  }

  const merged = Array.from(configMap.values());
  setLocal(STORAGE_KEYS.CERT_CONFIGS, merged);
  return merged;
};

export const saveCertificateConfig = async (config: CertificateConfig): Promise<void> => {
  const list = getLocal<CertificateConfig[]>(STORAGE_KEYS.CERT_CONFIGS, []);
  const idx = list.findIndex(c => c.activityId === config.activityId && c.level === config.level && c.academicYear === config.academicYear);
  if (idx >= 0) {
    list[idx] = config;
  } else {
    list.push(config);
  }
  setLocal(STORAGE_KEYS.CERT_CONFIGS, list);

  if (isFirebaseConfigured() && db) {
    try {
      const cleanData = cleanForFirestore(config);
      const docId = `${config.activityId}_${config.level}_${config.academicYear}`;
      await setDoc(doc(db, 'certificate_configs', docId), cleanData);
    } catch (err) {
      console.error("Firestore save certificate config failed:", err);
    }
  }
};

// Admin Session Auth
export const checkAdminAuth = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
};

export const setAdminAuth = (authenticated: boolean): void => {
  if (authenticated) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  }
};

// Certificate Number Sequence Settings API
export const getCertNumberConfig = async (year?: string): Promise<CertNumberConfig> => {
  const targetYear = year || getAcademicYear();
  const storageKey = `nwsp_cert_num_config_${targetYear}`;
  const defaultCfg: CertNumberConfig = {
    prefix: 'เลขที่ ',
    startingNumber: 1001,
    suffix: `/${targetYear}`,
    padding: 0
  };

  if (isFirebaseConfigured() && db) {
    try {
      const docSnap = await fetchWithTimeout(getDocs(query(collection(db, 'cert_num_configs'), where('academicYear', '==', targetYear))), 2000);
      let cloudConfig: CertNumberConfig | null = null;
      docSnap.forEach(d => {
        cloudConfig = d.data() as CertNumberConfig;
      });
      if (cloudConfig) {
        setLocal(storageKey, cloudConfig);
        return cloudConfig;
      }
    } catch (err) {
      console.warn("Firestore fetch cert number config warning:", err);
    }
  }

  return getLocal<CertNumberConfig>(storageKey, defaultCfg);
};

export const saveCertNumberConfig = async (config: CertNumberConfig, year?: string): Promise<void> => {
  const targetYear = year || getAcademicYear();
  const storageKey = `nwsp_cert_num_config_${targetYear}`;
  setLocal(storageKey, config);

  if (isFirebaseConfigured() && db) {
    try {
      const cleanData = cleanForFirestore({ ...config, academicYear: targetYear });
      await setDoc(doc(db, 'cert_num_configs', `config_${targetYear}`), cleanData);
    } catch (err) {
      console.error("Firestore save cert number config failed:", err);
    }
  }
};
