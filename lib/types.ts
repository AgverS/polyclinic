import { Doctor, Specialty, User } from "./generated/prisma";

export type FullDoctor = Doctor & {
  doctorSpecialties: {
    specialty: Specialty;
  }[];
  user: User;
};
