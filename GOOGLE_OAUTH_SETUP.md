# Configuração do Google OAuth para DNA Analysis

## Passo 1: Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Anote o ID do projeto

## Passo 2: Habilitar APIs Necessárias

1. No menu lateral, vá para "APIs & Services" > "Library"
2. Procure e habilite as seguintes APIs:
   - Google+ API (ou People API)
   - Google Drive API (para armazenamento de áudio)

## Passo 3: Configurar OAuth Consent Screen

1. Vá para "APIs & Services" > "OAuth consent screen"
2. Escolha "External" como tipo de usuário
3. Preencha as informações obrigatórias:
   - App name: `DNA - Deep Narrative Analysis`
   - User support email: seu email
   - Developer contact information: seu email
4. Adicione os escopos necessários:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `../auth/drive.file` (para Google Drive)

## Passo 4: Criar Credenciais OAuth

1. Vá para "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "OAuth 2.0 Client IDs"
3. Escolha "Web application"
4. Configure as URLs:
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (para desenvolvimento)
     - `https://seu-dominio.netlify.app` (para produção)
   
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/callback/google` (para desenvolvimento)
     - `https://seu-dominio.netlify.app/api/auth/callback/google` (para produção)

5. Anote o **Client ID** e **Client Secret**

## Passo 5: Configurar Variáveis de Ambiente

Atualize seu arquivo `.env.local` com as credenciais:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=seu-client-id-aqui
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=uma-string-secreta-aleatoria-muito-longa

# Supabase Configuration (você precisa configurar também)
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico-do-supabase
```

## Passo 6: Configurar Supabase

1. Acesse [Supabase](https://supabase.com/)
2. Crie um novo projeto
3. Vá para Settings > API
4. Copie a URL do projeto e as chaves API
5. Execute o script SQL do arquivo `database_setup.sql` no SQL Editor do Supabase

## Passo 7: Testar a Configuração

1. Reinicie o servidor de desenvolvimento: `npm run dev`
2. Acesse `http://localhost:3000`
3. Tente fazer login com Google

## Solução de Problemas Comuns

### Erro "redirect_uri_mismatch"
- Verifique se as URLs de redirecionamento estão corretas no Google Cloud Console
- Certifique-se de que `NEXTAUTH_URL` está configurado corretamente

### Erro "invalid_client"
- Verifique se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão corretos
- Certifique-se de que não há espaços extras nas variáveis de ambiente

### Erro "access_denied"
- Verifique se o OAuth Consent Screen está configurado corretamente
- Certifique-se de que o email usado para teste está autorizado (se em modo de teste)

## Para Produção (Netlify)

1. No painel do Netlify, vá para Site Settings > Environment Variables
2. Adicione todas as variáveis de ambiente necessárias
3. Atualize `NEXTAUTH_URL` para a URL do seu site Netlify
4. Adicione a URL do Netlify nas configurações do Google OAuth

## Próximos Passos

Após configurar o Google OAuth:
1. Configure o Deepgram para transcrição de áudio
2. Configure o Google Drive para armazenamento de arquivos
3. Teste todas as funcionalidades da aplicação