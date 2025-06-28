import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { SupabaseAdapter } from '@auth/supabase-adapter';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  callbacks: {
    async session({ session, token }) {
      // Adiciona o ID do usuário à sessão para uso em outras partes da aplicação
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Preserva o ID do usuário no token JWT
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Permite redirecionamentos para URLs do mesmo domínio
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Permite redirecionamentos para o domínio base
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  // Ensure NEXTAUTH_URL is always available with fallback logic
  url: process.env.NEXTAUTH_URL || 
       (typeof window !== 'undefined' ? window.location.origin : 
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
        process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 
        'http://localhost:3000'),
});

export { handler as GET, handler as POST };