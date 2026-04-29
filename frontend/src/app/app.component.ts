import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

type ChatRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
  role: ChatRole;
  text: string;
  ts: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  apiBase = 'http://127.0.0.1:8000';
  statusText = 'checking...';
  statusOk = false;

  uploadFile: File | null = null;
  uploadInProgress = false;
  uploadMessage = '';

  chatInput = '';
  chatInProgress = false;
  chatMessages: ChatMessage[] = [];

  lastError = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.checkHealth();
  }

  checkHealth(): void {
    this.statusText = 'checking...';
    this.statusOk = false;
    this.http.get<{ status?: string; message?: string }>(`${this.apiBase}/`).subscribe({
      next: (data) => {
        const message = data?.message ?? 'online';
        this.statusText = message;
        this.statusOk = true;
        this.lastError = '';
      },
      error: (err: HttpErrorResponse) => {
        this.statusText = err?.message ?? 'offline';
        this.statusOk = false;
        this.lastError = 'No se pudo conectar al backend.';
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.uploadFile = input.files && input.files.length > 0 ? input.files[0] : null;
  }

  uploadFileToBackend(): void {
    if (!this.uploadFile) {
      this.lastError = 'Selecciona un archivo antes de subir.';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.uploadFile);

    this.uploadInProgress = true;
    this.uploadMessage = '';
    this.lastError = '';

    this.http.post<{ filename?: string; status?: string; info?: string }>(`${this.apiBase}/ingestar/`, formData).subscribe({
      next: (data) => {
        const fileName = data?.filename ?? this.uploadFile?.name ?? 'archivo';
        this.uploadMessage = `${fileName} procesado.`;
        this.uploadInProgress = false;
      },
      error: (err: HttpErrorResponse) => {
        this.lastError = err?.error?.detail || 'Error al procesar el archivo.';
        this.uploadInProgress = false;
      }
    });
  }

  sendChat(): void {
    const question = this.chatInput.trim();
    if (!question || this.chatInProgress) {
      return;
    }

    this.chatMessages = [
      ...this.chatMessages,
      { role: 'user', text: question, ts: this.formatTime(new Date()) }
    ];
    this.chatInput = '';
    this.chatInProgress = true;
    this.lastError = '';

    this.http.post<{ respuesta?: string }>(`${this.apiBase}/chat/`, null, {
      params: { pregunta: question }
    }).subscribe({
      next: (data) => {
        const responseText = data?.respuesta ?? 'Sin respuesta del servidor.';
        this.chatMessages = [
          ...this.chatMessages,
          { role: 'assistant', text: responseText, ts: this.formatTime(new Date()) }
        ];
        this.chatInProgress = false;
      },
      error: (err: HttpErrorResponse) => {
        this.lastError = err?.error?.detail || 'Error al consultar el chat.';
        this.chatInProgress = false;
      }
    });
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
