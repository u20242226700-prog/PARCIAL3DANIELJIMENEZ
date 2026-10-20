import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
  IonSearchbar, IonSelect, IonSelectOption, IonList, IonItem, IonAvatar,
  IonLabel, IonBadge, IonModal, IonButtons, IonButton, IonSpinner, IonNote,
  ToastController
} from '@ionic/angular';
import { TicketService } from '../services/ticket.service';
import { Ticket, Prioridad } from '../models/ticket.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol,
    IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
    IonSearchbar, IonSelect, IonSelectOption, IonList, IonItem, IonAvatar,
    IonLabel, IonBadge, IonModal, IonButtons, IonButton, IonSpinner, IonNote
  ],
})
export class HomePage implements OnInit {
  private ticketService = inject(TicketService);
  private toastCtrl = inject(ToastController);
  private cdr = inject(ChangeDetectorRef);

  tickets: Ticket[] = [];  
  lista: Ticket[] = [];    
  busqueda = '';
  filtroEstado = 'todos';
  filtroPrioridad = 'todas';
  cargando = true;
  error = '';

  modalAbierto = false;
  seleccionado: Ticket | null = null;
  estadoModal = '';
  prioridadModal = '';
  intentoGuardar = false;

  private orden: Record<Prioridad, number> = { alta: 0, media: 1, baja: 2 };

  ngOnInit() {
    this.cargarTickets();
  }

  cargarTickets() {
    this.cargando = true;
    this.error = '';
    this.ticketService.getTickets().subscribe({
      next: data => {
        this.tickets = data;
        this.filtrar();
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'No se pudieron cargar los tickets';
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  get eficiencia(): number {
    if (this.tickets.length === 0) return 0;
    const resueltos = this.tickets.reduce((acc, t) => t.resuelto ? acc + 1 : acc, 0);
    return Math.round((resueltos / this.tickets.length) * 1000) / 10;
  }

  get pendientes(): number {
    return this.tickets.filter(t => !t.resuelto).length;
  }

  filtrar() {
    const texto = this.busqueda.trim().toLowerCase();
    this.lista = this.tickets
      .filter(t => this.filtroEstado === 'todos' || (this.filtroEstado === 'resuelto' ? t.resuelto : !t.resuelto))
      .filter(t => this.filtroPrioridad === 'todas' || t.prioridad === this.filtroPrioridad)
      .filter(t => texto === '' || t.asunto.toLowerCase().includes(texto) || String(t.id) === texto)
      .sort((a, b) => this.orden[a.prioridad] - this.orden[b.prioridad] || a.id - b.id);
  }

  limpiar() {
    this.busqueda = '';
    this.filtroEstado = 'todos';
    this.filtroPrioridad = 'todas';
    this.filtrar();
  }

  colorPrioridad(p: Prioridad): string {
    if (p === 'alta') return 'danger';
    if (p === 'media') return 'warning';
    return 'medium';
  }

  abrir(t: Ticket) {
    this.seleccionado = t;
    this.estadoModal = t.resuelto ? 'resuelto' : 'pendiente';
    this.prioridadModal = '';
    this.intentoGuardar = false;
    this.modalAbierto = true;
  }

  cerrar() {
    this.modalAbierto = false;
  }

  // se limpia cuando termina la animacion de cierre
  alCerrarModal() {
    this.modalAbierto = false;
    this.seleccionado = null;
  }

  async guardar() {
    this.intentoGuardar = true;
    if (!this.seleccionado || !this.estadoModal || !this.prioridadModal) return;

    const id = this.seleccionado.id;
    this.tickets = this.tickets.map(t =>
      t.id === id
        ? { ...t, resuelto: this.estadoModal === 'resuelto', prioridad: this.prioridadModal as Prioridad }
        : t
    );
    this.filtrar();
    this.cerrar();
    this.cdr.markForCheck();

    const toast = await this.toastCtrl.create({
      message: `Ticket #${id} actualizado`,
      duration: 2500,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }
}