export type Role = "PATIENT" | "DOCTOR" | "ADMIN";
export const ROLES = {
  PATIENT: "PATIENT",
  DOCTOR: "DOCTOR",
  ADMIN: "ADMIN",
} as const;

export type DoctorCategory = "HIGHEST" | "FIRST" | "SECOND";
export const DOCTOR_CATEGORIES = {
  HIGHEST: "HIGHEST",
  FIRST: "FIRST",
  SECOND: "SECOND",
} as const;

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export const APPOINTMENT_STATUSES = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;

export type UserModel = {
  id: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  email: string;
  password?: string;
  fullName: string;
  role: Role;
};

export type SpecialtyModel = {
  id: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  name: string;
};

export type DoctorModel = {
  id: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: number;
  category: DoctorCategory;
  room: number;
  experience: number;
};

export type FullDoctor = DoctorModel & {
  doctorSpecialties: {
    specialty: SpecialtyModel;
  }[];
  user: UserModel;
};
