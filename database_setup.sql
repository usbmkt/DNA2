-- ====================================================================
-- CONFIGURAÇÃO COMPLETA DO BANCO DE DADOS SUPABASE PARA DNA ANALYSIS
-- ====================================================================

-- Habilita a extensão pgcrypto se ainda não estiver habilitada, para gen_random_uuid()
-- Usar UUIDs (Universally Unique Identifier) como chaves primárias é uma prática recomendada
-- para evitar que um atacante adivinhe IDs sequenciais e descubra o número de usuários.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- TABELAS PRINCIPAIS
-- ====================================================================

-- Tabela para armazenar as sessões de análise de cada usuário.
CREATE TABLE analysis_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Esta é a chave estrangeira que liga cada sessão a um usuário na tabela 'users' do sistema de autenticação do Supabase.
    -- ON DELETE CASCADE é uma regra poderosa: se um usuário for excluído, todas as suas sessões de análise serão automaticamente removidas,
    -- mantendo a integridade dos dados.
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    final_synthesis TEXT,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled'))
);

-- Tabela para armazenar cada resposta individual (áudio e transcrição) de uma sessão.
CREATE TABLE user_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES analysis_sessions(id) ON DELETE CASCADE NOT NULL,
    question_index INTEGER NOT NULL,
    question_text TEXT,
    transcript_text TEXT,
    -- O ID do arquivo retornado pela API do Google Drive. Este é o nosso link para o arquivo de áudio.
    audio_file_drive_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Garante que não haja respostas duplicadas para a mesma pergunta na mesma sessão
    UNIQUE(session_id, question_index)
);

-- ====================================================================
-- ÍNDICES PARA PERFORMANCE
-- ====================================================================

-- Índice para buscar sessões por usuário (consulta mais comum)
CREATE INDEX idx_analysis_sessions_user_id ON analysis_sessions(user_id);

-- Índice para buscar respostas por sessão
CREATE INDEX idx_user_responses_session_id ON user_responses(session_id);

-- Índice para buscar respostas por ordem de pergunta
CREATE INDEX idx_user_responses_question_index ON user_responses(session_id, question_index);

-- ====================================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ====================================================================

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela analysis_sessions
CREATE TRIGGER update_analysis_sessions_updated_at 
    BEFORE UPDATE ON analysis_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- ATIVAÇÃO DA SEGURANÇA EM NÍVEL DE LINHA (ROW LEVEL SECURITY - RLS)
-- ====================================================================

-- Esta é a principal camada de defesa do nosso banco de dados. Sem RLS, a chave 'anon' pública
-- daria acesso de leitura a todos os dados. Com RLS, por padrão, ninguém pode ver nada.
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- POLÍTICAS DE ACESSO (ROW LEVEL SECURITY POLICIES)
-- ====================================================================

-- POLÍTICAS PARA analysis_sessions
-- ====================================

-- Política 1: Usuários podem LER (SELECT) suas próprias sessões de análise.
-- A função auth.uid() magicamente retorna o ID do usuário que está fazendo a requisição.
-- A condição `USING (auth.uid() = user_id)` filtra as linhas, retornando apenas aquelas que pertencem ao usuário.
CREATE POLICY "Allow individual read access on analysis_sessions"
ON analysis_sessions FOR SELECT 
USING (auth.uid() = user_id);

-- Política 2: Usuários podem CRIAR (INSERT) sessões para si mesmos.
-- A cláusula `WITH CHECK` garante que um usuário não possa criar uma sessão para outro usuário.
CREATE POLICY "Allow individual insert access on analysis_sessions"
ON analysis_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política 3: Usuários podem ATUALIZAR suas próprias sessões
CREATE POLICY "Allow individual update access on analysis_sessions"
ON analysis_sessions FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- POLÍTICAS PARA user_responses
-- ===============================

-- Política 4: Usuários podem LER suas próprias respostas
-- Para ler ou escrever uma resposta, o sistema primeiro precisa encontrar a sessão à qual a resposta pertence
-- e então verificar se o usuário atual é o dono daquela sessão. Isso previne qualquer tipo de acesso cruzado aos dados.
CREATE POLICY "Allow individual read access on user_responses"
ON user_responses FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM analysis_sessions WHERE id = session_id));

-- Política 5: Usuários podem CRIAR respostas em suas próprias sessões
CREATE POLICY "Allow individual insert access on user_responses"
ON user_responses FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM analysis_sessions WHERE id = session_id));

-- Política 6: Usuários podem ATUALIZAR suas próprias respostas
CREATE POLICY "Allow individual update access on user_responses"
ON user_responses FOR UPDATE 
USING (auth.uid() = (SELECT user_id FROM analysis_sessions WHERE id = session_id))
WITH CHECK (auth.uid() = (SELECT user_id FROM analysis_sessions WHERE id = session_id));

-- ====================================================================
-- FUNÇÕES AUXILIARES
-- ====================================================================

-- Função para obter estatísticas de uma sessão
CREATE OR REPLACE FUNCTION get_session_stats(session_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'session_id', s.id,
        'total_questions', 10, -- Número fixo de perguntas
        'answered_questions', COUNT(r.id),
        'completion_percentage', (COUNT(r.id) * 100.0 / 10),
        'created_at', s.created_at,
        'updated_at', s.updated_at,
        'status', s.status
    )
    INTO result
    FROM analysis_sessions s
    LEFT JOIN user_responses r ON s.id = r.session_id
    WHERE s.id = session_uuid
    AND s.user_id = auth.uid()
    GROUP BY s.id, s.created_at, s.updated_at, s.status;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- DADOS INICIAIS (OPCIONAL)
-- ====================================================================

-- Inserir perguntas padrão da análise (para referência)
CREATE TABLE IF NOT EXISTS analysis_questions (
    id SERIAL PRIMARY KEY,
    question_index INTEGER NOT NULL UNIQUE,
    question_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO analysis_questions (question_index, question_text) VALUES
(0, 'Conte-me sobre um momento em sua vida que você considera um ponto de virada significativo. O que aconteceu e como isso mudou você?'),
(1, 'Descreva uma situação em que você teve que tomar uma decisão muito difícil. Como você chegou à sua escolha e o que aprendeu sobre si mesmo?'),
(2, 'Fale sobre uma pessoa que teve grande influência em sua vida. Como ela impactou seus valores e perspectivas?'),
(3, 'Relate uma experiência em que você enfrentou um grande desafio ou obstáculo. Como você lidou com isso e o que descobriu sobre sua resiliência?'),
(4, 'Conte sobre um momento em que você se sentiu mais autêntico e verdadeiro consigo mesmo. O que estava acontecendo e por que foi significativo?'),
(5, 'Descreva uma situação em que seus valores foram testados ou questionados. Como você reagiu e o que isso revelou sobre suas convicções?'),
(6, 'Fale sobre um sonho ou objetivo que você tem para o futuro. Por que é importante para você e como pretende alcançá-lo?'),
(7, 'Relate uma experiência de perda ou luto que marcou sua vida. Como você processou essa experiência e o que ela ensinou sobre você?'),
(8, 'Conte sobre um momento em que você teve que perdoar alguém ou a si mesmo. Como foi esse processo e o que aprendeu sobre perdão?'),
(9, 'Descreva como você vê seu propósito de vida atualmente. Como essa visão evoluiu ao longo do tempo?')
ON CONFLICT (question_index) DO NOTHING;

-- ====================================================================
-- COMENTÁRIOS FINAIS
-- ====================================================================

-- Este script configura completamente o banco de dados para a aplicação DNA Analysis.
-- Ele inclui:
-- 1. Estrutura de tabelas otimizada
-- 2. Índices para performance
-- 3. Triggers para manutenção automática
-- 4. Políticas de segurança RLS completas
-- 5. Funções auxiliares para estatísticas
-- 6. Dados iniciais das perguntas

-- Para executar este script:
-- 1. Acesse o painel do Supabase
-- 2. Vá para SQL Editor
-- 3. Cole este script completo
-- 4. Execute com "RUN"

-- IMPORTANTE: Certifique-se de que as variáveis de ambiente estão configuradas:
-- - NEXT_PUBLIC_SUPABASE_URL
-- - NEXT_PUBLIC_SUPABASE_ANON_KEY  
-- - SUPABASE_SERVICE_ROLE_KEY

