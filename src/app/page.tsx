'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthComponent } from '@/components/AuthComponent';

export default function HomePage() {
  return (
    <SessionProvider>
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              DNA - Deep Narrative Analysis
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra padrões profundos em sua narrativa pessoal através de análise psicológica avançada 
              baseada em inteligência artificial. Uma jornada de autoconhecimento única e personalizada.
            </p>
          </div>
          
          <AuthComponent />
          
          <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Análise por Voz</h3>
              <p className="text-gray-600">
                Responda perguntas profundas através de gravações de áudio, permitindo uma expressão mais natural e autêntica.
              </p>
            </div>
            
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Insights Profundos</h3>
              <p className="text-gray-600">
                Receba análises detalhadas sobre sua personalidade, valores, padrões comportamentais e potencial de crescimento.
              </p>
            </div>
            
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Privacidade Total</h3>
              <p className="text-gray-600">
                Seus dados são protegidos com criptografia de ponta e utilizados exclusivamente para sua análise pessoal.
              </p>
            </div>
          </div>
        </div>
      </main>
    </SessionProvider>
  );
}

