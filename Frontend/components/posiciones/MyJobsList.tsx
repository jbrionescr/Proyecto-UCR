"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, Briefcase, Calendar } from "lucide-react";

// Mock data para las posiciones publicadas por el exalumno
const myJobs: any[] = [];

export function MyJobsList() {
  if (myJobs.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 text-left">
      <h3 className="text-2xl font-bold text-[#0f4c81] mb-6 border-b pb-2">Mis Posiciones Publicadas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myJobs.map((job) => (
          <Card key={job.id} className="glass shadow-sm hover:shadow-md transition-all border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-lg text-primary leading-tight">{job.title}</CardTitle>
                <Badge 
                  className={
                    job.status === "ACTIVA" ? "bg-green-100 text-green-700 hover:bg-green-200 border-0" :
                    "bg-slate-100 text-slate-700 hover:bg-slate-200 border-0"
                  }
                >
                  {job.status}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                Publicado el {job.postedDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{job.type === "EMPLEO" ? "Tiempo Completo" : "Pasantía"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Candidatos aplicaron: <strong className="text-blue-600">{job.applicationsCount}</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
