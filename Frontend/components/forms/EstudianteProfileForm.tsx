"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { estudianteProfileSchema, EstudianteProfileFormValues } from "@/lib/validations/profile";
import { TIPOS_APOYO } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export function EstudianteProfileForm() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  
  const form = useForm<EstudianteProfileFormValues>({
    resolver: zodResolver(estudianteProfileSchema),
    defaultValues: {
      carrera: "",
      avanceProyecto: 0,
      apoyoBuscado: [],
      nivelBeca: "",
    },
  });

  const onSubmit = async (data: EstudianteProfileFormValues) => {
    toast({
      title: "Perfil completado",
      description: "Tus datos han sido guardados exitosamente.",
    });
    console.log("Datos de Estudiante:", data);
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger(["carrera", "avanceProyecto"]);
    }
    if (isValid) setStep(2);
  };

  const prevStep = () => setStep(1);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-xl mx-auto bg-white/90 backdrop-blur-xl border border-slate-200/50 hover:border-[#00C0F3]/30 shadow-2xl p-8 md:p-10 rounded-3xl relative overflow-hidden font-body text-slate-800 transition-all duration-500">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1.5 bg-transparent w-full z-10">
          <motion.div 
            className="h-full bg-ucr-celeste-medium rounded-tl-3xl"
            initial={{ width: "50%" }}
            animate={{ width: step === 1 ? "50%" : "100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-ucr-celeste-medium font-display">
            Completá tu Perfil de Estudiante
          </h2>
          <p className="text-slate-400 mt-1 font-body text-sm font-medium">Paso {step} de 2</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="carrera"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body font-semibold text-slate-700 text-sm block mb-2">Carrera Actual</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej. Ingeniería en Computación" 
                        {...field} 
                        className="transition-all focus:scale-[1.01] font-body text-base bg-white/80 border-gray-200 focus:border-[#00C0F3] focus:ring-[#00C0F3] transition-all shadow-sm font-body text-base h-12 rounded-xl" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avanceProyecto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body font-semibold text-slate-700 text-sm block mb-2">Avance del Proyecto de Graduación (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        {...field} 
                        onChange={e => field.onChange(Number(e.target.value))} 
                        className="transition-all focus:scale-[1.01] font-body text-base bg-white/80 border-gray-200 focus:border-[#00C0F3] focus:ring-[#00C0F3] transition-all shadow-sm font-body text-base h-12 rounded-xl" 
                      />
                    </FormControl>
                    <FormDescription className="font-body text-xs text-slate-400 mt-1">Si aún no has iniciado, indicá 0.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nivelBeca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body font-semibold text-slate-700 text-sm block mb-2">Nivel de Beca UCR (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej. Beca 5" 
                        {...field} 
                        className="transition-all focus:scale-[1.01] font-body text-base bg-white/80 border-gray-200 focus:border-[#00C0F3] focus:ring-[#00C0F3] transition-all shadow-sm font-body text-base h-12 rounded-xl" 
                      />
                    </FormControl>
                    <FormDescription className="font-body text-xs text-emerald-600 mt-1">Este dato es ESTRICTAMENTE PRIVADO y nunca se mostrará públicamente.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button 
                  type="button" 
                  onClick={nextStep} 
                  className="w-full md:w-auto md:min-w-[140px] h-12 bg-ucr-celeste-medium hover:bg-ucr-celeste-medium/90 text-white text-base font-bold shadow-lg hover:shadow-ucr-celeste-medium/30 transition-all rounded-xl font-body tracking-wide flex items-center justify-center"
                >
                  Siguiente
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="apoyoBuscado"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-lg font-bold font-body text-slate-800">¿Qué tipo de apoyo buscas?</FormLabel>
                      <FormDescription className="font-body text-slate-500 text-sm mt-1">
                        Seleccioná todas las opciones en las que necesites ayuda de un exalumno.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {TIPOS_APOYO.map((apoyo) => (
                        <FormField
                          key={apoyo}
                          control={form.control}
                          name="apoyoBuscado"
                          render={({ field }) => {
                            const isChecked = field.value?.includes(apoyo);
                            return (
                              <FormItem
                                key={apoyo}
                                className={`flex flex-row items-center space-x-3 space-y-0 rounded-xl border p-4 transition-all cursor-pointer ${
                                  isChecked 
                                    ? "border-ucr-celeste-medium bg-ucr-celeste-medium/5 shadow-sm" 
                                    : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                                }`}
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, apoyo])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== apoyo
                                            )
                                          )
                                    }}
                                    className="border-slate-300 data-[state=checked]:bg-ucr-celeste-medium data-[state=checked]:border-ucr-celeste-medium"
                                  />
                                </FormControl>
                                <FormLabel className="font-semibold cursor-pointer text-sm flex-1 leading-snug text-slate-700 font-body select-none">
                                  {apoyo}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep} 
                  className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 font-body font-semibold px-6 h-12 rounded-xl transition-all shadow-sm"
                >
                  ← Atrás
                </Button>
                <Button 
                  type="submit" 
                  className="h-12 bg-ucr-celeste-medium hover:bg-ucr-celeste-medium/90 text-white text-base font-bold shadow-lg hover:shadow-ucr-celeste-medium/30 transition-all rounded-xl font-body tracking-wide px-8 flex items-center justify-center"
                >
                  Completar Perfil
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Form>
  );
}
