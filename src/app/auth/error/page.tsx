'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Home } from 'lucide-react';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'Configuration':
        return 'Erro de configuração do servidor. Entre em contato com o suporte.';
      case 'AccessDenied':
        return 'Acesso negado. Você cancelou o login ou não tem permissão.';
      case 'Verification':
        return 'Token de verificação inválido ou expirado.';
      case 'OAuthCallback':
        return 'Erro no callback do OAuth. Tente fazer login novamente.';
      case 'OAuthAccountNotLinked':
        return 'Esta conta já está vinculada a outro provedor de login.';
      case 'EmailCreateAccount':
        return 'Não foi possível criar uma conta com este email.';
      case 'Callback':
        return 'Erro no processo de callback de autenticação.';
      case 'OAuthCreateAccount':
        return 'Não foi possível criar a conta OAuth.';
      case 'EmailSignin':
        return 'Não foi possível enviar o email de login.';
      case 'CredentialsSignin':
        return 'Credenciais de login inválidas.';
      case 'SessionRequired':
        return 'Você precisa estar logado para acessar esta página.';
      case 'Default':
      default:
        return 'Ocorreu um erro durante a autenticação. Tente novamente.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600 flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Erro de Autenticação
            </CardTitle>
            <CardDescription>
              Ocorreu um problema durante o processo de login
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {getErrorMessage(error)}
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  Tentar Novamente
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Voltar ao Início
                </Link>
              </Button>
            </div>
            
            <div className="text-xs text-center text-muted-foreground">
              <p>
                Se o problema persistir, entre em contato com nosso suporte técnico.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}