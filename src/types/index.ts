export type StatusRota = 'pendente' | 'carregado' | 'entregue';

export interface RotaItem {
  id: string;
  PRODUTO: string;
  'QTD.': string | number;
  'PESO KG/L': string | number;
  'FILIAL ORIGEM': string;
  'FILIAL DESTINO': string;
  OBS?: string;
  status: StatusRota;
}

export interface GrupoRota {
  idGrupo: string;
  origem: string;
  destino: string;
  itens: RotaItem[];
  pesoTotalTrecho: number;
}