export type LevelCategory = 'ม.ต้น' | 'ม.ปลาย';

export type StudentTitle = 'เด็กชาย' | 'เด็กหญิง' | 'นาย' | 'นางสาว';

export type StudentGrade = 'ม.1' | 'ม.2' | 'ม.3' | 'ม.4' | 'ม.5' | 'ม.6';

export type AwardType = 'รางวัลชนะเลิศ' | 'รองชนะเลิศอันดับ 1' | 'รองชนะเลิศอันดับ 2' | 'รางวัลชมเชย' | 'เข้าร่วมการแข่งขัน';

export interface ScheduleInfo {
  date: string;
  time: string;
  location: string;
}

export interface Activity {
  id: string;
  academicYear: string; // e.g. "2569"
  title: string;
  type: 'individual' | 'team';
  teamSize: number;
  teachers: string[]; // ครูผู้ดูแลกิจกรรม
  levels: LevelCategory[];
  details: string;
  rules: string;
  awardsText: string;
  order?: number; // ลำดับการแสดงผลหน้าแรก (1, 2, 3...)
  schedules: {
    junior?: ScheduleInfo;
    senior?: ScheduleInfo;
    general?: ScheduleInfo;
  };
  isOpen: boolean;
  createdAt: string;
}

export interface ApplicantStudent {
  studentId: string; // 5 digits exact
  title: StudentTitle;
  fullName: string;
  grade: StudentGrade;
  room: number; // 1-5 for ม.1-3, 1-4 for ม.4-6
}

export interface Registration {
  id: string;
  academicYear: string;
  activityId: string;
  activityTitle: string;
  level: LevelCategory;
  teamName?: string;
  members: ApplicantStudent[];
  registeredAt: string;
}

export interface CompetitionResult {
  id: string;
  academicYear: string;
  activityId: string;
  activityTitle: string;
  level: LevelCategory;
  registrationId: string;
  teamName?: string;
  members: ApplicantStudent[];
  award: AwardType;
  certificateId?: string; // Manual or auto certificate ID
  score?: string;
  updatedAt: string;
}

export interface TextPosition {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  fontSize: number;
  color: string;
  fontWeight: string;
  fontFamily?: string; // 'Prompt' | 'Sarabun' | 'Charm' | 'Chonburi' | 'Mali' | 'Niramit'
}

export interface CertificateConfig {
  id: string;
  academicYear: string;
  activityId: string;
  level: LevelCategory;
  bgImageUrl?: string;
  fontFamily?: string;
  positions: {
    studentName: TextPosition;
    award: TextPosition;
    activityName: TextPosition;
    levelText: TextPosition;
    issueDate: TextPosition;
    certId: TextPosition;
  };
}

export interface CertNumberConfig {
  prefix: string; // e.g. "เลขที่ " or ""
  startingNumber: number; // e.g. 1903
  suffix: string; // e.g. "/2569"
  padding: number; // e.g. 0 (no leading zeros) or 4 (0001)
}
