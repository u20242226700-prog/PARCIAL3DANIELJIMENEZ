import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Ticket, Prioridad } from '../models/ticket.model';

interface TodoApi {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}
@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);
  private readonly url = 'https://jsonplaceholder.typicode.com/todos';

  getTickets(): Observable<Ticket[]> {
    return this.http.get<TodoApi[]>(this.url).pipe(
      map(res => res.slice(0, 50).map(t => this.aTicket(t)))
    );
  }
  private aTicket(t: TodoApi): Ticket {
    const prioridades: Prioridad[] = ['alta', 'media', 'baja'];
    return {
      id: t.id,
      usuarioId: t.userId,
      asunto: t.title,
      resuelto: t.completed,
      prioridad: prioridades[t.id % 3],
    };
  }
}