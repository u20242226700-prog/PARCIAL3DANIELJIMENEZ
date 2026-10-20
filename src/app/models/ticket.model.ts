export type Prioridad = 'alta' | 'media' | 'baja';

export interface Ticket {
    id: number;
    usuarioId: number;
    asunto: string;
    resuelto: boolean;
    prioridad: Prioridad;

}