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
      // Clean baseUrl to remove any whitespace
      const cleanBaseUrl = baseUrl?.trim() || 'http://localhost:3000';
      
      // Permite redirecionamentos para URLs do mesmo domínio
      if (url.startsWith("/")) return `${cleanBaseUrl}${url}`;
      
      // Permite redirecionamentos para o domínio base
      try {
        const urlObj = new URL(url.trim(), cleanBaseUrl);
        if (urlObj.origin === cleanBaseUrl) return url;
      } catch (error) {
        // If URL parsing fails, return baseUrl as fallback
        console.warn('Invalid URL in redirect callback:', url, error);
        return cleanBaseUrl;
      }
      return cleanBaseUrl;
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
  // Ensure NEXTAUTH_URL is always available with fallback logic and trim whitespace
  url: (process.env.NEXTAUTH_URL?.trim()) || 
       (typeof window !== 'undefined' ? window.location.origin : 
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim()}` :
        process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 
        'http://localhost:3000'),
});

export { handler as GET, handler as POST };