import { 
  Activity, 
  Registration, 
  CompetitionResult, 
  CertificateConfig 
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

// --- Storage API Service --- //

export const getAcademicYear = (): string => {
  return getLocal<string>(STORAGE_KEYS.CURRENT_YEAR, '2569');
};

export const setAcademicYear = async (year: string): Promise<void> => {
  setLocal<string>(STORAGE_KEYS.CURRENT_YEAR, year);
};

// Get Activities (Cloud Firebase sync with Local fallback)
export const getActivities = async (year?: string): Promise<Activity[]> => {
  const targetYear = year || getAcademicYear();
  
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'activities'), where('academicYear', '==', targetYear));
      const querySnapshot = await fetchWithTimeout(getDocs(q), 1500);
      const cloudActivities: Activity[] = [];
      querySnapshot.forEach((docSnap) => {
        cloudActivities.push(docSnap.data() as Activity);
      });
      if (cloudActivities.length > 0) {
        return cloudActivities;
      }
    } catch (err) {
      console.warn("Firestore fetch activities failed, falling back to LocalStorage:", err);
    }
  }

  // Local Storage Fallback
  let localList = getLocal<Activity[]>(STORAGE_KEYS.ACTIVITIES, []);
  if (localList.length === 0) {
    // Seed initial activities if empty
    setLocal<Activity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
    localList = INITIAL_ACTIVITIES;
  }

  let yearActivities = localList.filter(act => act.academicYear === targetYear);

  // Requirement: If new academic year has zero activities, carry forward / clone baseline activities template automatically!
  if (yearActivities.length === 0) {
    const clonedTemplateActivities: Activity[] = INITIAL_ACTIVITIES.map(baseAct => ({
      ...baseAct,
      id: `${baseAct.id}-${targetYear}`,
      academicYear: targetYear,
      isOpen: true,
      createdAt: new Date().toISOString()
    }));

    // Save cloned template activities to storage
    localList = [...clonedTemplateActivities, ...localList];
    setLocal<Activity[]>(STORAGE_KEYS.ACTIVITIES, localList);
    
    // Also save to Firebase if configured
    if (isFirebaseConfigured() && db) {
      for (const act of clonedTemplateActivities) {
        try {
          await setDoc(doc(db, 'activities', act.id), act);
        } catch (err) {
          console.error("Firestore auto-clone activity failed:", err);
        }
      }
    }

    yearActivities = clonedTemplateActivities;
  }

  return yearActivities;
};

export const saveActivity = async (activity: Activity): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'activities', activity.id), activity);
    } catch (err) {
      console.error("Firestore save activity failed:", err);
    }
  }

  // Update Local Storage
  const list = getLocal<Activity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  const idx = list.findIndex(a => a.id === activity.id);
  if (idx >= 0) {
    list[idx] = activity;
  } else {
    list.unshift(activity);
  }
  setLocal(STORAGE_KEYS.ACTIVITIES, list);
};

export const deleteActivity = async (id: string): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'activities', id));
    } catch (err) {
      console.error("Firestore delete activity failed:", err);
    }
  }

  const list = getLocal<Activity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  const updated = list.filter(a => a.id !== id);
  setLocal(STORAGE_KEYS.ACTIVITIES, updated);
};

// Registrations API
export const getRegistrations = async (year?: string): Promise<Registration[]> => {
  const targetYear = year || getAcademicYear();

  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'registrations'), where('academicYear', '==', targetYear));
      const querySnapshot = await fetchWithTimeout(getDocs(q), 1500);
      const cloudData: Registration[] = [];
      querySnapshot.forEach((docSnap) => {
        cloudData.push(docSnap.data() as Registration);
      });
      if (cloudData.length > 0) {
        return cloudData;
      }
    } catch (err) {
      console.warn("Firestore fetch registrations failed, using LocalStorage:", err);
    }
  }

  let list = getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
  if (list.length === 0 && targetYear === '2569') {
    setLocal(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    list = INITIAL_REGISTRATIONS;
  }
  return list.filter(r => r.academicYear === targetYear);
};

export const saveRegistration = async (registration: Registration): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'registrations', registration.id), registration);
    } catch (err) {
      console.error("Firestore save registration failed:", err);
    }
  }

  const list = getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
  const idx = list.findIndex(r => r.id === registration.id);
  if (idx >= 0) {
    list[idx] = registration;
  } else {
    list.unshift(registration);
  }
  setLocal(STORAGE_KEYS.REGISTRATIONS, list);
};

export const deleteRegistration = async (id: string): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'registrations', id));
    } catch (err) {
      console.error("Firestore delete registration failed:", err);
    }
  }

  const list = getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
  const updated = list.filter(r => r.id !== id);
  setLocal(STORAGE_KEYS.REGISTRATIONS, updated);
};

// Results API
export const getResults = async (year?: string): Promise<CompetitionResult[]> => {
  const targetYear = year || getAcademicYear();

  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'results'), where('academicYear', '==', targetYear));
      const querySnapshot = await fetchWithTimeout(getDocs(q), 1500);
      const cloudData: CompetitionResult[] = [];
      querySnapshot.forEach((docSnap) => {
        cloudData.push(docSnap.data() as CompetitionResult);
      });
      if (cloudData.length > 0) {
        return cloudData;
      }
    } catch (err) {
      console.warn("Firestore fetch results failed, using LocalStorage:", err);
    }
  }

  let list = getLocal<CompetitionResult[]>(STORAGE_KEYS.RESULTS, []);
  if (list.length === 0 && targetYear === '2569') {
    setLocal(STORAGE_KEYS.RESULTS, INITIAL_RESULTS);
    list = INITIAL_RESULTS;
  }
  return list.filter(r => r.academicYear === targetYear);
};

export const saveResult = async (result: CompetitionResult): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'results', result.id), result);
    } catch (err) {
      console.error("Firestore save result failed:", err);
    }
  }

  const list = getLocal<CompetitionResult[]>(STORAGE_KEYS.RESULTS, INITIAL_RESULTS);
  const idx = list.findIndex(r => r.id === result.id);
  if (idx >= 0) {
    list[idx] = result;
  } else {
    list.unshift(result);
  }
  setLocal(STORAGE_KEYS.RESULTS, list);
};

export const deleteResult = async (id: string): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'results', id));
    } catch (err) {
      console.error("Firestore delete result failed:", err);
    }
  }

  const list = getLocal<CompetitionResult[]>(STORAGE_KEYS.RESULTS, []);
  const updated = list.filter(r => r.id !== id);
  setLocal(STORAGE_KEYS.RESULTS, updated);
};

// Certificate Config API
export const getCertificateConfigs = async (): Promise<CertificateConfig[]> => {
  let list = getLocal<CertificateConfig[]>(STORAGE_KEYS.CERT_CONFIGS, []);
  return list;
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
