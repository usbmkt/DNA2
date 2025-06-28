# Configuração Correta das URLs do Google OAuth

## URLs que você precisa adicionar no Google Cloud Console

### 1. Origens JavaScript autorizadas:
```
http://localhost:3000
https://dna-analysis.netlify.app
```

### 2. URIs de redirecionamento autorizados:
```
http://localhost:3000/api/auth/callback/google
https://dna-analysis.netlify.app/api/auth/callback/google
```

## Passos para corrigir:

1. **Na seção "Origens JavaScript autorizadas":**
   - Clique em "Adicionar URI"
   - Adicione: `http://localhost:3000`
   - Clique em "Adicionar URI" novamente
   - Adicione: `https://dna-analysis.netlify.app` (ou sua URL do Netlify)

2. **Na seção "URIs de redirecionamento autorizados":**
   - Clique em "Adicionar URI"
   - Adicione: `http://localhost:3000/api/auth/callback/google`
   - Clique em "Adicionar URI" novamente
   - Adicione: `https://dna-analysis.netlify.app/api/auth/callback/google`

3. **Clique em "SALVAR"**

## Importante:
- Substitua `dna-analysis.netlify.app` pela URL real do seu site no Netlify
- Certifique-se de que não há espaços extras nas URLs
- As URLs devem ser exatamente como mostrado acima

## Depois de salvar:
1. Copie o Client ID e Client Secret
2. Adicione-os ao arquivo `.env.local` do projeto
3. Reinicie o servidor de desenvolvimento