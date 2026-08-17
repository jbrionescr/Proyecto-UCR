"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Github, Wallet } from "lucide-react";

// Mock data para las postulaciones del estudiante actual
const myApplications: any[] = [];

export function MyApplicationsList() {
  if (myApplications.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 text-left">
      <h3 className="text-2xl font-bold text-[#0f4c81] mb-6 border-b pb-2">Mis Postulaciones</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myApplications.map((app) => (
          <Card key={app.id} className="glass shadow-sm hover:shadow-md transition-all border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-lg text-primary leading-tight">{app.projectName}</CardTitle>
                <Badge 
                  className={
                    app.status === "ACTIVA" ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border-0" :
                    app.status === "FINANCIADA" ? "bg-green-100 text-green-700 hover:bg-green-200 border-0" :
                    "bg-slate-100 text-slate-700 hover:bg-slate-200 border-0"
                  }
                >
                  {app.status}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                Publicado el {app.date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Github className="w-4 h-4 text-slate-400" />
                  <a href={app.github} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                    {app.github.replace("https://github.com/", "")}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Wallet className="w-4 h-4 text-slate-400" />
                  <span>Donaciones recibidas: <strong className="text-green-600">₡{app.donationsReceived.toLocaleString()}</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
