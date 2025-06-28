'use client';

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, AlertCircle } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const errorParam = searchParams.get('error');

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push('/dashboard');
      }
    });

    // Handle error from URL params
    if (errorParam) {
      switch (errorParam) {
        case 'OAuthCallback':
          setError('Erro na autenticação com Google. Tente novamente.');
          break;
        case 'OAuthAccountNotLinked':
          setError('Esta conta já está vinculada a outro provedor.');
          break;
        case 'EmailCreateAccount':
          setError('Não foi possível criar a conta com este email.');
          break;
        case 'Callback':
          setError('Erro no callback de autenticação.');
          break;
        case 'OAuthCreateAccount':
          setError('Não foi possível criar a conta OAuth.');
          break;
        case 'EmailSignin':
          setError('Não foi possível enviar o email de login.');
          break;
        case 'CredentialsSignin':
          setError('Credenciais inválidas.');
          break;
        case 'SessionRequired':
          setError('Você precisa estar logado para acessar esta página.');
          break;
        default:
          setError('Ocorreu um erro durante a autenticação.');
      }
    }
  }, [errorParam, router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await signIn('google', {
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError('Erro ao fazer login com Google. Tente novamente.');
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">
              DNA - Deep Narrative Analysis
            </CardTitle>
            <CardDescription>
              Faça login para começar sua jornada de autoconhecimento através da análise narrativa profunda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {isLoading ? 'Entrando...' : 'Entrar com Google'}
            </Button>
            
            <div className="text-xs text-center text-muted-foreground">
              <p>
                Ao fazer login, você concorda com nossos termos de uso e política de privacidade.
                Seus dados são protegidos e utilizados apenas para análise psicológica.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}