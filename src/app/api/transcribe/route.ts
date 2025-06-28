import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { DeepgramClient, createClient } from '@deepgram/sdk';
import { supabaseAdmin } from '@/lib/supabase';
import { googleDriveService } from '@/services/googleDrive';

/**
 * API Route para transcrever áudio e salvar dados
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação
    const session = await getServerSession();
    
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Pega os dados da requisição
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const sessionId = formData.get('sessionId') as string;
    const questionIndex = parseInt(formData.get('questionIndex') as string);
    const questionText = formData.get('questionText') as string;

    if (!audioFile || !sessionId || questionIndex === undefined) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Verifica se a chave da API da Deepgram está configurada
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
      console.error('Chave da API da Deepgram não configurada');
      return NextResponse.json(
        { error: 'Serviço de transcrição não configurado' },
        { status: 500 }
      );
    }

    // Converte o arquivo para buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Inicializa o cliente da Deepgram
    const deepgram: DeepgramClient = createClient(deepgramApiKey);

    // Executa operações em paralelo para máxima eficiência
    const [transcriptionResult, userFolderId] = await Promise.all([
      // Transcrição com Deepgram
      deepgram.listen.prerecorded.transcribeFile(audioBuffer, {
        model: 'nova-2',
        language: 'pt-BR',
        smart_format: true,
      }),
      // Criação/obtenção da pasta do usuário no Google Drive
      googleDriveService.createUserFolder(session.user.email),
    ]);

    // Verifica se houve erro na transcrição
    if (transcriptionResult.error) {
      console.error('Erro na transcrição:', transcriptionResult.error);
      throw new Error('Falha na transcrição do áudio');
    }

    // Extrai o texto transcrito
    const transcript = transcriptionResult.result?.results?.channels[0]?.alternatives[0]?.transcript || '';

    // Faz upload do áudio para o Google Drive
    const audioFileName = googleDriveService.generateAudioFileName(sessionId, questionIndex);
    const audioFileId = await googleDriveService.uploadAudioFile(
      audioBuffer,
      audioFileName,
      userFolderId
    );

    // Salva a resposta no banco de dados
    const { data: userResponse, error: dbError } = await supabaseAdmin
      .from('user_responses')
      .insert([
        {
          session_id: sessionId,
          question_index: questionIndex,
          question_text: questionText,
          transcript_text: transcript,
          audio_file_drive_id: audioFileId,
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar no banco de dados:', dbError);
      return NextResponse.json(
        { error: 'Erro ao salvar dados' },
        { status: 500 }
      );
    }

    // Retorna o resultado
    return NextResponse.json({
      transcript,
      response_id: userResponse.id,
      message: 'Áudio processado e salvo com sucesso'
    });

  } catch (error) {
    console.error('Erro interno na API de transcrição:', error);
    return NextResponse.json(
      { error: 'Falha ao processar áudio' },
      { status: 500 }
    );
  }
}