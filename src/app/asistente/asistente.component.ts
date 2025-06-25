import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-asistente',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './asistente.component.html',
  styleUrls: ['./asistente.component.scss']
})
export class AsistenteComponent implements OnInit, OnDestroy {
  recognition: any;
  escuchando = false;
  soporteVoz = true;
  ultimoTextoReconocido: string = '';
  silencioTimeout: any = null;

  constructor() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {};
      window.speechSynthesis.getVoices();
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'es-ES';
      this.recognition.continuous = true;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        console.log('🔊 Escuchando...');
        this.iniciarTemporizadorSilencio();
      };

      this.recognition.onresult = (event: any) => {
        const texto = event.results[event.resultIndex][0].transcript.trim();
        if (texto) {
          console.log('✅ Texto reconocido:', texto);
          this.ultimoTextoReconocido = texto;
          this.leerTexto(texto);
          this.reiniciarTemporizadorSilencio();
        }
      };

      this.recognition.onerror = (e: any) => {
        this.escuchando = false;
        this.limpiarTemporizadorSilencio();
        console.error('❌ Error en reconocimiento de voz:', e);
      };

      this.recognition.onend = () => {
        this.limpiarTemporizadorSilencio();
        console.log('🔁 Reconocimiento finalizado');
        if (this.escuchando) {
          this.recognition.start();
          this.iniciarTemporizadorSilencio();
          console.log('🔄 Reiniciando reconocimiento...');
        }
      };
    } else {
      this.soporteVoz = false;
      console.warn('🚫 Reconocimiento de voz no soportado');
    }
  }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.recognition) {
      this.recognition.stop();
    }
    window.speechSynthesis.cancel();
    this.limpiarTemporizadorSilencio();
  }

  escuchar() {
    if (this.recognition) {
      if (this.escuchando) {
        this.recognition.stop();
        this.escuchando = false;
        this.limpiarTemporizadorSilencio();
        console.log('⏹️ Escucha detenida por el usuario');
      } else {
        this.ultimoTextoReconocido = '';
        this.escuchando = true;
        this.recognition.start();
        this.iniciarTemporizadorSilencio();
        console.log('🎙️ Escucha iniciada por el usuario');
      }
    }
  }

  iniciarTemporizadorSilencio() {
    this.limpiarTemporizadorSilencio();
    this.silencioTimeout = setTimeout(() => {
      if (this.escuchando) {
        this.recognition.stop();
        this.escuchando = false;
        console.log('⏰ Silencio detectado: escucha detenida automáticamente');
      }
    }, 5000); // 5 segundos
  }

  reiniciarTemporizadorSilencio() {
    this.iniciarTemporizadorSilencio();
  }

  limpiarTemporizadorSilencio() {
    if (this.silencioTimeout) {
      clearTimeout(this.silencioTimeout);
      this.silencioTimeout = null;
    }
  }

  leerTexto(texto: string) {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    utterance.rate = 0.8;

    const voces = window.speechSynthesis.getVoices();
    const vozElegida =
      voces.find(v => v.lang.startsWith('es') && v.name.toLowerCase().includes('monica')) ||
      voces.find(v => v.lang.startsWith('es'));

    if (vozElegida) {
      utterance.voice = vozElegida;
      console.log('🗣️ Voz seleccionada:', vozElegida.name, vozElegida.lang);
    } else {
      console.warn('⚠️ Voz en español no encontrada, usando predeterminada');
    }

    utterance.onstart = () => console.log('🔊 Hablando...');
    utterance.onend = () => {
      console.log('✅ Fin de voz');
      this.ultimoTextoReconocido = '';
    };
    utterance.onerror = (e: any) => console.error('❌ Error al hablar:', e);

    const esperarYHablar = () => {
      if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(esperarYHablar, 200);
      }
    };

    setTimeout(esperarYHablar, 200);
  }
}
