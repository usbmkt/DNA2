'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { SessionProvider } from 'next-auth/react';
import { AnalysisComponent } from '@/components/AnalysisComponent';
import { AuthComponent } from '@/components/AuthComponent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Session {
  id: string;
  created_at: string;
  final_synthesis?: string;
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      fetchSessions();
    }
  }, [session]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSessionId(data.session.id);
        toast({
          title: 'Nova Sessão Criada',
          description: 'Sua sessão de análise foi iniciada com sucesso.',
        });
      } else {
        throw new Error('Falha ao criar sessão');
      }
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar uma nova sessão. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!session) {
    return <AuthComponent />;
  }

  if (currentSessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentSessionId(null)}
              className="mb-4"
            >
              ← Voltar ao Dashboard
            </Button>
          </div>
          <AnalysisComponent sessionId={currentSessionId} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard - DNA Analysis
            </h1>
            <p className="text-gray-600 mt-2">
              Bem-vindo, {session.user?.name}! Gerencie suas sessões de análise narrativa.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <img
              src={session.user?.image || ''}
              alt={session.user?.name || ''}
              className="w-10 h-10 rounded-full"
            />
            <Button onClick={() => window.location.href = '/api/auth/signout'}>
              Sair
            </Button>
          </div>
        </div>

        {/* Nova Sessão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Iniciar Nova Análise
            </CardTitle>
            <CardDescription>
              Comece uma nova sessão de análise narrativa profunda com 10 perguntas cuidadosamente elaboradas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={createNewSession} size="lg" className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Criar Nova Sessão
            </Button>
          </CardContent>
        </Card>

        {/* Sessões Anteriores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Suas Sessões de Análise
            </CardTitle>
            <CardDescription>
              Histórico de todas as suas sessões de análise narrativa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Você ainda não possui sessões de análise. Crie sua primeira sessão para começar!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((sessionItem) => (
                  <div
                    key={sessionItem.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Sessão {sessionItem.id.slice(0, 8)}...
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {formatDate(sessionItem.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={sessionItem.final_synthesis ? 'default' : 'secondary'}>
                        {sessionItem.final_synthesis ? 'Concluída' : 'Em Progresso'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSessionId(sessionItem.id)}
                      >
                        {sessionItem.final_synthesis ? 'Ver Resultados' : 'Continuar'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações sobre o Processo */}
        <Card>
          <CardHeader>
            <CardTitle>Como Funciona a Análise DNA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">1. Gravação de Respostas</h4>
                <p className="text-sm text-gray-600">
                  Responda 10 perguntas profundas através de gravações de áudio, permitindo uma expressão mais natural e autêntica de seus pensamentos.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Transcrição Inteligente</h4>
                <p className="text-sm text-gray-600">
                  Suas respostas são automaticamente transcritas usando tecnologia avançada de reconhecimento de voz em português brasileiro.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Análise Psicológica</h4>
                <p className="text-sm text-gray-600">
                  Nossa equipe especializada analisa suas narrativas para identificar padrões psicológicos, valores e traços de personalidade.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4. Relatório Personalizado</h4>
                <p className="text-sm text-gray-600">
                  Receba insights detalhados sobre sua personalidade, motivações e recomendações para desenvolvimento pessoal.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <SessionProvider>
      <DashboardContent />
    </SessionProvider>
  );
}

