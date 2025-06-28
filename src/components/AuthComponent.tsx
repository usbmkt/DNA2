'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogIn, LogOut, User } from 'lucide-react';

export function AuthComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (session) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="h-5 w-5" />
            Bem-vindo ao DNA
          </CardTitle>
          <CardDescription>
            Você está autenticado e pronto para começar sua análise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
              <AvatarFallback>
                {session.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{session.user?.name}</p>
              <p className="text-xs text-muted-foreground">{session.user?.email}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => window.location.href = '/dashboard'} 
              className="flex-1"
            >
              Ir para Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => signOut()}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-green-600">
          DNA - Deep Narrative Analysis
        </CardTitle>
        <CardDescription>
          Faça login para começar sua jornada de autoconhecimento através da análise narrativa profunda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => signIn('google')}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
        >
          <LogIn className="h-4 w-4" />
          Entrar com Google
        </Button>
        
        <div className="mt-4 text-xs text-center text-muted-foreground">
          <p>
            Ao fazer login, você concorda com nossos termos de uso e política de privacidade.
            Seus dados são protegidos e utilizados apenas para análise psicológica.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

