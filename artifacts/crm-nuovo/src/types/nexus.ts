export interface ClientePreload {
  nome: string;
  indirizzo: string;
  piva: string;
  email: string;
}

export interface PreventivoItem {
  id: string;
  descrizione: string;
  quantita: number;
  prezzo: number;
  totale: number;
}

export interface Preventivo {
  id?: string;
  cliente_nome: string;
  cliente_indirizzo: string;
  cliente_piva: string;
  cliente_email: string;
  items: PreventivoItem[];
  totale_complessivo: number;
  data_creazione?: string;
  user_id?: string;
}
