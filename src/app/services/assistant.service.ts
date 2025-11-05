import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AssistantSampleDto {
  _id?: string;
  projectId: string;
  text: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssistantService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createSample(projectId: string, text: string): Observable<AssistantSampleDto> {
    return this.http.post<AssistantSampleDto>(`${this.apiUrl}/assistant/samples`, { projectId, text });
  }

  listSamples(projectId: string): Observable<AssistantSampleDto[]> {
    return this.http.get<AssistantSampleDto[]>(`${this.apiUrl}/assistant/samples?projectId=${projectId}`);
  }

  deleteSample(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/assistant/samples/${id}`);
  }

  startFineTune(projectId: string, baseModel?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/assistant/fine-tune`, { projectId, baseModel });
  }

  uploadDoc(projectId: string, text: string, metadata?: any): Observable<{ created: number }> {
    return this.http.post<{ created: number }>(`${this.apiUrl}/assistant/docs`, { projectId, text, metadata });
  }

  ask(projectId: string, question: string, k: number = 5): Observable<{ answer: string; citations: any[] }> {
    return this.http.post<{ answer: string; citations: any[] }>(`${this.apiUrl}/assistant/answer`, { projectId, question, k });
  }

  chatWithAudio(projectId: string, audioFile: File, assistantName?: string, voice?: string, systemInstructions?: string): Observable<{
    transcription: string;
    response: string;
    audioUrl: string;
    citations: any[];
  }> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('projectId', projectId);
    if (assistantName) {
      formData.append('assistantName', assistantName);
    }
    if (voice) {
      formData.append('voice', voice);
    }
    if (systemInstructions) {
      formData.append('systemInstructions', systemInstructions);
    }
    return this.http.post<{
      transcription: string;
      response: string;
      audioUrl: string;
      citations: any[];
    }>(`${this.apiUrl}/assistant/chat`, formData);
  }

  // Settings
  getSettings(projectId: string): Observable<{ systemInstructions: string }> {
    return this.http.get<{ systemInstructions: string }>(`${this.apiUrl}/assistant/settings?projectId=${projectId}`);
  }

  saveSettings(projectId: string, systemInstructions: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.apiUrl}/assistant/settings`, { projectId, systemInstructions });
  }
}

