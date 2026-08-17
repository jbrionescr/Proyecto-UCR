import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

async function main() {
  const email = "stephsgfwd@gmail.com";
  const password = "Sami12345";

  try {
    console.log("Buscando/Creando usuario en Supabase Auth...");
    
    // Primero listamos para ver si ya existe
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;
    
    let existingUser = usersData.users.find(u => u.email === email);
    let userId = "";

    if (existingUser) {
      console.log("El usuario ya existe en Supabase Auth. Actualizando contraseña y forzando confirmación...");
      userId = existingUser.id;
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, { 
        password: password,
        email_confirm: true 
      });
      if (updateError) throw updateError;
    } else {
      console.log("El usuario NO existe en Supabase Auth. Creándolo...");
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: "Administrador Steph" }
      });
      if (createError) throw createError;
      userId = createData.user.id;
    }

    console.log("Usuario Supabase configurado correctamente. ID:", userId);
    console.log("Sincronizando en la base de datos de Prisma...");

    // Upsert en Prisma con el ID de Supabase
    await prisma.user.upsert({
      where: { id: userId },
      update: {
        email,
        nombre: "Administrador Steph",
        tipo: "ADMIN",
        status: "ACTIVO",
        email_verified: true
      },
      create: {
        id: userId,
        email,
        nombre: "Administrador Steph",
        tipo: "ADMIN",
        status: "ACTIVO",
        email_verified: true
      }
    });

    console.log("¡Administrador creado y configurado con éxito! Ya puedes iniciar sesión.");
  } catch (e: any) {
    console.error("Error al configurar admin:", e.message || e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
