import { google } from 'googleapis';

export class GoogleDriveService {
  private drive: any;
  private auth: any;

  constructor() {
    // Configuração da autenticação OAuth2
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'urn:ietf:wg:oauth:2.0:oob' // Para aplicações server-side
    );

    // Define o refresh token para autenticação automática
    this.auth.setCredentials({
      refresh_token: process.env.GOOGLE_DRIVE_ADMIN_REFRESH_TOKEN,
    });

    // Inicializa o cliente do Google Drive
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  /**
   * Cria uma pasta para o usuário no Google Drive se não existir
   */
  async createUserFolder(userEmail: string): Promise<string> {
    try {
      const folderName = `DNA_Analysis_${userEmail.replace('@', '_at_')}`;
      const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

      // Verifica se a pasta já existe
      const existingFolders = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and parents in '${parentFolderId}' and trashed=false`,
        fields: 'files(id, name)',
      });

      if (existingFolders.data.files.length > 0) {
        return existingFolders.data.files[0].id;
      }

      // Cria nova pasta
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined,
      };

      const folder = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id',
      });

      return folder.data.id;
    } catch (error) {
      console.error('Erro ao criar pasta do usuário:', error);
      throw new Error('Falha ao criar pasta no Google Drive');
    }
  }

  /**
   * Faz upload de um arquivo de áudio para o Google Drive
   */
  async uploadAudioFile(
    audioBuffer: Buffer,
    fileName: string,
    userFolderId: string
  ): Promise<string> {
    try {
      const fileMetadata = {
        name: fileName,
        parents: [userFolderId],
      };

      const media = {
        mimeType: 'audio/mp3',
        body: audioBuffer,
      };

      const file = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
      });

      return file.data.id;
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      throw new Error('Falha ao fazer upload do áudio para o Google Drive');
    }
  }

  /**
   * Gera um nome único para o arquivo de áudio
   */
  generateAudioFileName(sessionId: string, questionIndex: number): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `audio_session_${sessionId}_q${questionIndex}_${timestamp}.mp3`;
  }
}

// Instância singleton do serviço
export const googleDriveService = new GoogleDriveService();

