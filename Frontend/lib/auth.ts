import NextAuth, { CredentialsSignin } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseAdmin } from "@/lib/supabase-admin";
import prisma from "@/lib/prisma";

class InvalidCredentials extends CredentialsSignin {
  constructor(message?: string) {
    super(message);
    this.code = message || "Credenciales inválidas";
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "ucr-alumni-nextauth-secret-2026-change-in-prod",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // 1. Autenticar contra Supabase directamente
          const { data: authData, error: authError } =
            await supabaseAdmin.auth.signInWithPassword({
              email: credentials.email as string,
              password: credentials.password as string,
            });

          if (authError || !authData.session) {
            throw new InvalidCredentials(
              authError?.message ?? "Correo o contraseña incorrectos."
            );
          }

          // 2. Buscar usuario en la BD con Supabase Admin
          const { data: user, error: userError } = await supabaseAdmin
            .from('USERS')
            .select('id, email, nombre, tipo, foto_url, email_verified, status')
            .eq('email', credentials.email as string)
            .maybeSingle();

          if (userError || !user) {
            throw new InvalidCredentials("Usuario no encontrado en el sistema.");
          }

          // 3. Sincronizar email_verified con Supabase si no está verificado
          if (!user.email_verified) {
            const { data: supabaseUser } =
              await supabaseAdmin.auth.admin.getUserById(user.id);

            if (supabaseUser?.user?.email_confirmed_at) {
              await supabaseAdmin
                .from('USERS')
                .update({ email_verified: true })
                .eq('id', user.id);
            } else {
              throw new InvalidCredentials(
                "Debes verificar tu correo antes de iniciar sesión."
              );
            }
          }

          // 4. Verificar que la cuenta no esté suspendida
          if (user.status === "SUSPENDIDO") {
            throw new InvalidCredentials(
              "Tu cuenta ha sido suspendida. Contacta al administrador."
            );
          }

          return {
            id: user.id,
            name: user.nombre,
            email: user.email,
            tipo: user.tipo,
            foto_url: user.foto_url,
            accessToken: authData.session.access_token,
          } as any;
        } catch (error: any) {
          if (error instanceof CredentialsSignin) throw error;
          console.error("[auth] Error inesperado en authorize:", error?.message ?? error);
          throw new InvalidCredentials(
            "Error de conexión con el servidor. Intenta de nuevo más tarde."
          );
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
    updateAge: 24 * 60 * 60, // refrescar cada 24h
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.tipo = (user as any).tipo;
        token.role = (user as any).tipo;
        token.foto_url = (user as any).foto_url;
        token.accessToken = (user as any).accessToken;
        delete (token as any).refreshToken;
      }

      // Si el token no tiene tipo (sesión creada antes de que se agregara el campo),
      // lo buscamos en la BD para que el sidebar y el middleware tengan el rol correcto.
      if (!token.tipo && token.id) {
        try {
          const { data: dbUser } = await supabaseAdmin
            .from('USERS')
            .select('tipo, foto_url')
            .eq('id', token.id as string)
            .maybeSingle();
            
          if (dbUser) {
            token.tipo = dbUser.tipo;
            token.role = dbUser.tipo;
            if (!token.foto_url) token.foto_url = dbUser.foto_url;
          }
        } catch {}
      }

      if (trigger === "update" && session?.user?.image) {
        token.foto_url = session.user.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.image = token.foto_url as string;
        (session.user as any).tipo = token.tipo;
        (session.user as any).role = token.tipo;
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).foto_url = token.foto_url;
      }
      return session;
    },
  },
});
