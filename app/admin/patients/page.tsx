"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Patient = {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
  appointment: {
    doctorName: string;
    startDateTime: string;
  } | null;
};

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    axios
      .get("/api/admin/patients", {
        headers: { "x-user-role": "ADMIN" },
      })
      .then((res) => setPatients(res.data));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Пациенты</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {patients.map((p) => {
          const date = p.appointment
            ? new Date(p.appointment.startDateTime)
            : null;

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border shadow-sm p-6 transition hover:shadow-lg"
            >
              <div>
                <div className="text-lg font-medium">{p.fullName}</div>
                <div className="text-sm text-gray-500">{p.email}</div>
              </div>

              {p.appointment && (
                <div className="mt-4 rounded-xl p-4 bg-linear-to-r from-indigo-50 to-purple-50">
                  <div className="text-sm">
                    <span className="font-medium">Врач:</span>{" "}
                    {p.appointment.doctorName}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-medium">Дата:</span>{" "}
                    {date?.toLocaleDateString()}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Время:</span>{" "}
                    {date?.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-400">
                Зарегистрирован: {new Date(p.createdAt).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
