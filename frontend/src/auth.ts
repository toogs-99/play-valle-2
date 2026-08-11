import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import type { Papel } from "@prisma/client";

export interface MarcaAcesso {
  marcaId: string;
  marcaNome: string;
  papel: Papel;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nome: string;
      email: string;
      marcas: MarcaAcesso[];
    };
  }

  interface User {
    id: string;
    nome: string;
    marcas: MarcaAcesso[];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    nome: string;
    marcas: MarcaAcesso[];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const usuario = await prisma.usuario.findUnique({
          where: { email },
          include: {
            marcas: {
              include: { marca: true },
            },
          },
        });

        if (!usuario) return null;

        const senhaValida = verifyPassword(password, usuario.senhaHash);
        if (!senhaValida) return null;

        const marcas: MarcaAcesso[] = usuario.marcas.map((um) => ({
          marcaId: um.marcaId,
          marcaNome: um.marca.nome,
          papel: um.papel,
        }));

        return {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          marcas,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nome = user.nome;
        token.marcas = user.marcas;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.nome = token.nome;
      session.user.marcas = token.marcas;
      return session;
    },
  },
});
