import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProfileComponent } from '../profile/profile.component';
import { ProjectContextService } from '../services/project-context.service';
import { AssistantService } from '../services/assistant.service';
import { environment } from '../../environments/environment';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  transcription?: string;
  response?: string;
  audioUrl?: string;
  timestamp: Date;
}

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarComponent, ProfileComponent],
  template: `
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <div class="assistant-page">
      <app-menubar (profileClick)="toggleProfile()"></app-menubar>
      <div class="main-content">
        <div class="assistant-container">
          <div class="top-actions">
            <button class="settings-btn" (click)="openSettings()" title="Ajustes">
              <i class="fas fa-cog"></i>
            </button>
          </div>

          <div class="chat-container" #chatContainer>
            <div class="chat-messages" #chatMessages>
              <div class="empty-state" *ngIf="messages.length === 0">
                <div class="assistant-illustration">
                  <div class="illustration-circle pulse" [class.recording]="isRecording" [class.thinking]="isThinking" (click)="toggleRecording()">
                    <i class="fas fa-microphone" *ngIf="!isRecording && !isThinking"></i>
                    <i class="fas fa-stop" *ngIf="isRecording"></i>
                    <i class="fas fa-spinner fa-spin" *ngIf="isThinking"></i>
                  </div>
                  <p class="empty-hint">Haz clic en la bolita para empezar a hablar</p>
                </div>
              </div>

              <div class="message" *ngFor="let msg of messages" [class.user]="msg.type === 'user'" [class.assistant]="msg.type === 'assistant'">
                <div class="message-content">
                  <div class="message-text" *ngIf="msg.type === 'user'">
                    <span>{{ msg.transcription }}</span>
                  </div>
                  <div class="message-text assistant-text" *ngIf="msg.type === 'assistant'">
                    <span>{{ msg.response }}</span>
                  </div>
                  <div class="message-audio" *ngIf="msg.type === 'assistant' && msg.audioUrl">
                    <audio #audioPlayer [src]="getAudioUrl(msg.audioUrl)" controls></audio>
                  </div>
                </div>
              </div>

            </div>

            <div class="chat-controls">
              <div class="text-input-wrapper">
                <div class="input-with-send">
                  <input
                    class="text-input"
                    type="text"
                    placeholder="Escribe un mensaje..."
                    [(ngModel)]="textMessage"
                    (keydown.enter)="sendTextMessage()"
                    [disabled]="!projectId || isThinking"
                  (focus)="scrollToBottom()"
                  (input)="scrollToBottom()"
                  />
                  <button 
                    class="send-btn-inside" 
                    (click)="textMessage.trim() ? sendTextMessage() : toggleRecording()"
                    [disabled]="!projectId || (isThinking && !isRecording)"
                    [class.recording]="isRecording"
                    [class.thinking]="isThinking"
                    [title]="textMessage.trim() ? 'Enviar' : (isRecording ? 'Parar' : (isThinking ? 'Procesando' : 'Hablar'))">
                    <ng-container *ngIf="textMessage.trim(); else micIcon">
                      <i class="fas fa-arrow-up"></i>
                    </ng-container>
                    <ng-template #micIcon>
                      <i class="fas fa-microphone" *ngIf="!isRecording && !isThinking"></i>
                      <i class="fas fa-stop" *ngIf="isRecording"></i>
                      <i class="fas fa-spinner fa-spin" *ngIf="!isRecording && isThinking"></i>
                    </ng-template>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <app-profile *ngIf="showProfile" (closeProfile)="closeProfile()"></app-profile>

      <div class="modal-backdrop" *ngIf="showSettings" (click)="closeSettings()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3 style="margin:0 0 12px 0; font-size:16px;">Ajustes del asistente</h3>
          <label class="modal-label">Instrucciones (opcional)</label>
          <textarea class="modal-textarea" [(ngModel)]="systemInstructions" rows="6" placeholder="Ejemplo: Sé breve, responde en español y con tono cercano..."></textarea>
          <div class="modal-actions">
            <button class="btn ghost" (click)="closeSettings()">Cancelar</button>
            <button class="btn primary" (click)="saveSystemInstructions()">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .assistant-page {
      width: 100%;
      height: 100vh;
      background: white;
      position: relative;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .main-content {
      margin-left: 250px;
      height: 100vh;
      background: #fff; /* todo blanco */
      overflow: hidden; /* dejamos que el scroll sea del área de mensajes */
      display: flex;
      flex-direction: column;
      min-height: 0; /* permitir que los hijos con overflow hagan scroll */
    }
    .assistant-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
      width: 100%;
      background: #fff; /* contenedor blanco */
      min-height: 0; /* necesario para scroll interno */
    }
    .top-actions { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .settings-btn { border: 1px solid #d1d5db; background: #fff; color:#111; width:36px; height:36px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .settings-btn:hover { background:#f3f4f6; }
    .assistant-header {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .assistant-name-section {
      margin-bottom: 0;
    }
    .name-input {
      width: 100%;
      font-size: 36px;
      font-weight: 700;
      padding: 6px 0;
      border: none;
      border-radius: 0;
      outline: none;
      background: transparent;
      color: #111;
      font-family: inherit;
    }
    .name-input::placeholder {
      color: #999;
    }
    .chat-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #fff; /* sin borde ni radios */
      border: none;
      border-radius: 0;
      overflow-y: scroll; /* el scroll principal vive aquí para que sticky funcione */
      scrollbar-gutter: stable;
      min-height: 0; /* crítico para que el scroll no se recorte */
      /* Ocultar barra de scroll visual, mantener desplazamiento */
      scrollbar-width: none; /* Firefox */
    }
    .chat-container::-webkit-scrollbar { width: 0; height: 0; }
    .chat-messages {
      flex: 1;
      overflow: visible; /* deja que el contenedor padre maneje el scroll */
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: #fff;
    }
    /* Forzar que la barra sea visible y con estilo (webkit-based) */
    /* (quitado estilos de scrollbar visible) */
    .empty-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    .assistant-illustration {
      text-align: center;
    }
    .illustration-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
      cursor: pointer;
      transition: all 0.3s ease;
      color: white;
      font-size: 32px;
    }
    .illustration-circle:hover:not(.recording):not(.thinking) {
      transform: scale(1.05);
      box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
    }
    .illustration-circle.recording {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      animation: pulse-recording 1s ease-in-out infinite;
    }
    .illustration-circle.thinking {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      animation: pulse-thinking 1.5s ease-in-out infinite;
    }
    .pulse {
      animation: pulse 3.2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.05);
        opacity: 0.95;
      }
    }
    @keyframes pulse-recording {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 8px 24px rgba(239, 68, 68, 0.5);
      }
      50% {
        transform: scale(1.1);
        box-shadow: 0 12px 32px rgba(239, 68, 68, 0.8);
      }
    }
    @keyframes pulse-thinking {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.08);
        opacity: 0.9;
      }
    }
    .illustration-text {
      color: #666;
      font-size: 15px;
      margin: 8px 0;
      font-weight: 600;
    }
    .empty-hint {
      color: #9ca3af;
      font-size: 14px;
      margin-top: 8px;
    }
    .message {
      display: flex;
      margin-top: 8px;
      margin-bottom: 8px;
    }
    .message.user {
      justify-content: flex-end;
    }
    .message.assistant {
      justify-content: flex-start;
    }
    .message-content {
      max-width: 70%;
      padding: 10px 16px; /* balance arriba/abajo */
      border-radius: 12px;
      background: transparent;
      border: none;
    }
    .message.user .message-content {
      background: #f3f4f6;
      color: #111;
      border-radius: 20px;
    }
    .message.assistant .message-content {
      background: transparent;
      border: none;
      color: #111;
    }
    .message-text {
      margin: 0; /* evitar espacio extra abajo */
      line-height: 1.45;
    }
    .message-text span {
      display: block;
    }
    .message-audio {
      margin-top: 8px;
    }
    .message-audio audio {
      width: 100%;
      max-width: 300px;
    }
    .message-time {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 4px;
    }
    .message.user .message-time {
      color: #9ca3af;
    }
    .thinking-message {
      opacity: 0.7;
    }
    .chat-controls {
      padding: 16px 24px;
      border-top: none; /* sin borde */
      background: #fff; /* estático y blanco */
      position: sticky; /* fijo al fondo del scroll del contenedor */
      bottom: 0;
      z-index: 10;
      flex: 0 0 auto; /* no permitir que se encoja */
      box-shadow: none; /* sin sombra */
    }
    .record-button-wrapper { display:none; }
    .text-input-wrapper {
      margin-top: 12px;
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .input-with-send {
      position: relative;
      flex: 1;
    }
    .text-input {
      width: 100%;
      padding: 14px 52px 14px 16px; /* un pelín más alto y con más redondeo */
      border: 1px solid #ccc;
      border-radius: 20px;
      font-size: 15px;
      outline: none;
      background: white;
      box-sizing: border-box;
    }
    .text-input:focus { border-color: #111; }
    .send-btn-inside {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      border: none;
      background: #111;
      color: #fff;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .send-btn-inside.recording { background: #dc2626; }
    .send-btn-inside.thinking { background: #d97706; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { width: 520px; max-width: 92%; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; box-sizing: border-box; }
    .modal-label { display:block; font-size: 13px; color:#374151; margin-bottom: 6px; }
    .modal-textarea { width: 100%; border:1px solid #d1d5db; border-radius:8px; padding:10px 12px; font-size:14px; outline:none; resize: vertical; box-sizing: border-box; }
    .modal-textarea:focus { border-color:#111; }
    .modal-actions { display:flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
    .btn { padding:10px 14px; border-radius:8px; border:1px solid transparent; cursor:pointer; font-weight:600; }
    .btn.ghost { background:#fff; border-color:#d1d5db; color:#111; }
    .btn.primary { background:#111; color:#fff; }
    .send-btn-inside:disabled { opacity: .5; cursor: not-allowed; }
    .record-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border: none;
      border-radius: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    .record-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }
    .record-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .record-button.recording {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    }
    .record-button.thinking {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    }
    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
      }
      .message-content {
        max-width: 85%;
      }
    }
  `]
})
export class AssistantComponent implements OnInit, OnDestroy {
  @ViewChild('chatMessages') chatMessages!: ElementRef;
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  showProfile: boolean = false;
  projectId: string | null = null;
  assistantName: string = '';
  selectedVoice: string = 'alloy';
  systemInstructions: string = '';
  messages: ChatMessage[] = [];
  isRecording: boolean = false;
  isThinking: boolean = false;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  textMessage: string = '';
  showSettings: boolean = false;

  constructor(
    private projectCtx: ProjectContextService,
    private assistantService: AssistantService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.projectCtx.currentProject$.subscribe(project => {
      this.projectId = project?._id || null;
      if (this.projectId) {
        const storedName = localStorage.getItem(`assistantName_${this.projectId}`);
        this.assistantName = storedName || (project as any)?.assistantName || '';
        // Cargar instrucciones desde backend
        this.assistantService.getSettings(this.projectId).subscribe({
          next: (r) => { this.systemInstructions = r?.systemInstructions || ''; },
          error: () => {}
        });
      } else {
        this.assistantName = '';
      }
    });
  }

  ngOnDestroy(): void {
    this.stopRecording();
  }

  saveAssistantName() {
    if (!this.projectId) return;
    localStorage.setItem(`assistantName_${this.projectId}`, this.assistantName);
  }

  openSettings() { this.showSettings = true; }
  closeSettings() { this.showSettings = false; }
  saveSystemInstructions() {
    if (!this.projectId) { this.showSettings = false; return; }
    this.assistantService.saveSettings(this.projectId, this.systemInstructions || '').subscribe({
      next: () => {},
      error: () => {}
    });
    this.showSettings = false;
    this.cdr.detectChanges();
  }

  @HostListener('document:keydown.escape')
  onEscClose() {
    if (this.showSettings) this.closeSettings();
  }

  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  sendTextMessage() {
    const text = (this.textMessage || '').trim();
    if (!this.projectId || !text || this.isThinking) return;

    if (!this.systemInstructions || !this.systemInstructions.trim()) {
      alert('Añade primero las instrucciones en Ajustes (icono de engranaje).');
      return;
    }

    // Añadir mensaje del usuario inmediatamente
    const userId = `u_${Date.now()}`;
    this.messages = [...this.messages, {
      id: userId,
      type: 'user',
      transcription: text,
      timestamp: new Date()
    }];
    this.textMessage = '';
    this.cdr.detectChanges();
    this.scrollToBottom();

    // Añadir mensaje de procesando
    const processingId = `p_${Date.now()}`;
    this.messages = [...this.messages, {
      id: processingId,
      type: 'assistant',
      response: 'Procesando...',
      timestamp: new Date()
    }];
    this.cdr.detectChanges();
    this.scrollToBottom();

    // Llamar al backend (RAG texto)
    this.assistantService.ask(this.projectId, text, 5).subscribe({
      next: (resp) => {
        const idx = this.messages.findIndex(m => m.id === processingId);
        if (idx !== -1) {
          this.messages = [
            ...this.messages.slice(0, idx),
            { id: processingId, type: 'assistant', response: resp.answer, timestamp: new Date() },
            ...this.messages.slice(idx + 1)
          ];
        }
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: () => {
        const idx = this.messages.findIndex(m => m.id === processingId);
        if (idx !== -1) {
          this.messages = [
            ...this.messages.slice(0, idx),
            { id: processingId, type: 'assistant', response: 'Error obteniendo la respuesta', timestamp: new Date() },
            ...this.messages.slice(idx + 1)
          ];
        }
        this.cdr.detectChanges();
        this.scrollToBottom();
      }
    });
  }

  async startRecording() {
    if (!this.projectId) {
      alert('No hay proyecto seleccionado');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        // Procesar inmediatamente cuando se detiene la grabación
        setTimeout(() => {
          this.processAudio();
        }, 0);
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (error) {
      console.error('Error accediendo al micrófono:', error);
      alert('No se pudo acceder al micrófono. Por favor, permite el acceso al micrófono en tu navegador.');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.isRecording = false;
      
      // Mostrar mensaje inmediatamente ANTES de detener la grabación
      const userMessageId = Date.now().toString();
      this.messages = [...this.messages, {
        id: userMessageId,
        type: 'user' as const,
        transcription: 'Transcribiendo...',
        timestamp: new Date()
      }];
      this.cdr.detectChanges();
      this.scrollToBottom();
      
      // Guardar el ID del mensaje para actualizarlo después
      (this as any).pendingUserMessageId = userMessageId;
      
      // Detener la grabación (esto disparará onstop)
      this.mediaRecorder.stop();
    }
  }

  async processAudio() {
    if (!this.projectId || this.audioChunks.length === 0) return;

    this.isThinking = true;
    if (!this.systemInstructions || !this.systemInstructions.trim()) {
      this.isThinking = false;
      alert('Añade primero las instrucciones en Ajustes (icono de engranaje).');
      return;
    }
    
    // Si ya hay un mensaje de "Transcribiendo...", no crear uno nuevo
    const userMessageId = (this as any).pendingUserMessageId || Date.now().toString();
    if (!(this as any).pendingUserMessageId) {
      this.messages = [...this.messages, {
        id: userMessageId,
        type: 'user' as const,
        transcription: 'Transcribiendo...',
        timestamp: new Date()
      }];
      this.cdr.detectChanges();
      this.scrollToBottom();
    }
    (this as any).pendingUserMessageId = userMessageId;
    
    // Usar setTimeout para asegurar que la UI se actualice
    await new Promise(resolve => setTimeout(resolve, 0));

    try {
      // Convertir audio a WAV
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const wavBlob = await this.convertToWav(audioBlob);
      const audioFile = new File([wavBlob], 'audio.wav', { type: 'audio/wav' });

      // Agregar mensaje de "Procesando..." mientras se procesa
      const processingMessageId = (Date.now() + 1).toString();
      this.messages = [...this.messages, {
        id: processingMessageId,
        type: 'assistant' as const,
        response: 'Procesando...',
        timestamp: new Date()
      }];
      this.scrollToBottom();
      this.cdr.detectChanges();

      // Enviar al backend
      this.assistantService.chatWithAudio(
        this.projectId, 
        audioFile, 
        this.assistantName,
        this.selectedVoice || 'alloy',
        this.systemInstructions || undefined
      ).subscribe({
        next: (response) => {
          // Limpiar el ID pendiente
          (this as any).pendingUserMessageId = null;
          
          // Actualizar mensaje del usuario con la transcripción real
          const userIndex = this.messages.findIndex(m => m.id === userMessageId);
          if (userIndex !== -1) {
            this.messages = [
              ...this.messages.slice(0, userIndex),
              {
                id: userMessageId,
                type: 'user' as const,
                transcription: response.transcription,
                timestamp: new Date()
              },
              ...this.messages.slice(userIndex + 1)
            ];
            this.cdr.detectChanges();
          }

          // Reemplazar mensaje de "Procesando..." con la respuesta real
          const processingIndex = this.messages.findIndex(m => m.id === processingMessageId);
          if (processingIndex !== -1) {
            // Crear nuevo array para forzar detección de cambios
            this.messages = [
              ...this.messages.slice(0, processingIndex),
              {
                id: processingMessageId,
                type: 'assistant' as const,
                response: response.response,
                audioUrl: response.audioUrl,
                timestamp: new Date()
              },
              ...this.messages.slice(processingIndex + 1)
            ];
          } else {
            // Si no se encontró, agregar nuevo mensaje
            this.messages = [...this.messages, {
              id: processingMessageId,
              type: 'assistant' as const,
              response: response.response,
              audioUrl: response.audioUrl,
              timestamp: new Date()
            }];
          }

          // Forzar detección de cambios
          this.cdr.detectChanges();

          this.isThinking = false;
          this.audioChunks = [];
          this.scrollToBottom();

          // Reproducir audio automáticamente cuando esté listo
          setTimeout(() => {
            this.playAudioAutomatically(response.audioUrl);
          }, 100);
        },
        error: (error) => {
          console.error('Error enviando audio:', error);
          // Remover mensaje de "Procesando..."
          const processingIndex = this.messages.findIndex(m => m.id === processingMessageId);
          if (processingIndex !== -1) {
            this.messages.splice(processingIndex, 1);
          }
          alert('Error al procesar el audio: ' + (error.error?.error || 'Error desconocido'));
          this.isThinking = false;
          this.audioChunks = [];
        }
      });
    } catch (error) {
      console.error('Error procesando audio:', error);
      alert('Error al procesar el audio');
      this.isThinking = false;
      this.audioChunks = [];
    }
  }

  async convertToWav(audioBlob: Blob): Promise<Blob> {
    // Convertir WebM a WAV usando Web Audio API
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const wavBuffer = this.audioBufferToWav(audioBuffer);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bytesPerSample = 2;
    const blockAlign = numberOfChannels * bytesPerSample;

    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * bytesPerSample);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * bytesPerSample, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * bytesPerSample, true);

    // Convertir audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  }

  getAudioUrl(audioUrl: string): string {
    if (audioUrl.startsWith('http')) {
      return audioUrl;
    }
    return `${environment.apiUrl}${audioUrl}`;
  }

  scrollToBottom() {
    setTimeout(() => {
      const container = this.chatContainer?.nativeElement as HTMLElement | undefined;
      const element = this.chatMessages?.nativeElement as HTMLElement | undefined;
      const target = container || element;
      if (target) target.scrollTop = target.scrollHeight;
    }, 100);
  }

  playAudioAutomatically(audioUrl: string) {
    // Buscar el elemento de audio por la URL
    const audioElements = document.querySelectorAll('audio');
    let targetAudio: HTMLAudioElement | null = null;
    
    audioElements.forEach((audio) => {
      const htmlAudio = audio as HTMLAudioElement;
      if (htmlAudio.src.includes(audioUrl)) {
        targetAudio = htmlAudio;
      }
    });

    if (!targetAudio) {
      // Si no se encuentra, intentar de nuevo después de un delay
      setTimeout(() => this.playAudioAutomatically(audioUrl), 200);
      return;
    }

    // Guardar referencia para usar dentro de los callbacks
    const audioElement: HTMLAudioElement = targetAudio;

    // Función para reproducir
    const playAudio = () => {
      audioElement.play().catch(err => {
        console.error('Error reproduciendo audio:', err);
      });
    };

    // Si ya está cargado, reproducir inmediatamente
    if (audioElement.readyState >= 2) {
      playAudio();
    } else {
      // Si no, esperar a que se cargue
      audioElement.addEventListener('loadeddata', playAudio, { once: true });
      audioElement.addEventListener('canplay', playAudio, { once: true });
      
      // Timeout de seguridad
      setTimeout(() => {
        if (audioElement.readyState >= 1) {
          playAudio();
        }
      }, 2000);
    }
  }

  toggleProfile() {
    this.showProfile = !this.showProfile;
  }

  closeProfile() {
    this.showProfile = false;
  }
}
