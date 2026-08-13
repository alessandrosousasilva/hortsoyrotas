import { Virtuoso } from 'react-virtuoso';
import { MapPin, Weight, AlertCircle, Package, CheckCircle2, Undo2, Edit2 } from 'lucide-react';
import { GrupoRota, RotaItem, StatusRota } from '../types';

interface ListaRotasProps {
  grupos: GrupoRota[];
  alterarStatus: (id: string, status: StatusRota) => void;
  abrirModalEditar: (item: RotaItem) => void;
}

export function ListaRotas({ grupos, alterarStatus, abrirModalEditar }: ListaRotasProps) {
  
  if (grupos.length === 0) {
    return (
      <div className="text-center p-6 text-sm font-medium text-gray-400 dark:text-gray-600 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 mt-2">
        Nenhuma carga encontrada para este trajeto.
      </div>
    );
  }

  return (

    <div style={{ height: 'calc(100vh - 220px)', width: '100%' }}>
      <Virtuoso
        data={grupos}
        itemContent={(_, grupo) => (
          <div className="pb-3 px-0.5"> {/* Espaçamento entre os cards */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-500 flex flex-col">
              
              {/* Cabeçalho do Card */}
              <div className="bg-emerald-50 dark:bg-gray-800/80 p-2.5 border-b border-emerald-100 dark:border-gray-700 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-gray-700 dark:text-gray-200">
                  <MapPin size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[100px]">{grupo.origem}</span>
                  <span className="text-emerald-300 dark:text-gray-500 font-normal">➔</span>
                  <span className="truncate max-w-[100px] text-emerald-800 dark:text-emerald-300">{grupo.destino}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-200/50 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    <Weight size={10} />
                    {grupo.pesoTotalTrecho.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-gray-300 bg-emerald-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {grupo.itens.length} {grupo.itens.length > 1 ? 'itens' : 'item'}
                  </span>
                </div>
              </div>

              {/* Lista de Produtos do Card */}
              <div className="flex flex-col flex-1 overflow-hidden">
                {grupo.itens.map((item) => (
                  <div key={item.id} className={`p-2.5 border-b border-gray-100 dark:border-gray-800 last:border-none flex justify-between items-center gap-2 transition-all duration-300
                    ${item.status === 'carregado' ? 'bg-amber-50/60 dark:bg-amber-500/5' : ''} 
                    ${item.status === 'entregue' ? 'bg-gray-50/80 dark:bg-gray-900/50 opacity-100 dark:opacity-80' : ''}`}
                  >
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-start gap-1.5 group">
                        <span className={`font-black text-xs shrink-0 ${item.status === 'entregue' ? 'text-gray-400 dark:text-gray-500' : 'text-emerald-600 dark:text-emerald-500'}`}>
                          {item['QTD.']}x
                        </span>
                        <h3 className={`font-bold text-[11px] leading-tight ${item.status === 'entregue' ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                          {item['PRODUTO']}
                        </h3>
                        <button onClick={() => abrirModalEditar(item)} className="text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-300 ml-1 shrink-0">
                          <Edit2 size={12} />
                        </button>
                      </div>
                      {item.OBS && String(item.OBS).trim() !== '' && (
                        <div className="mt-1 flex">
                          <div className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1 py-0.5 rounded inline-flex items-center gap-1 border border-amber-100 dark:border-amber-500/20">
                            <AlertCircle size={10} className="shrink-0" />
                            <span className="uppercase break-words">{item.OBS}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center">
                      {item.status === 'pendente' && (
                        <button onClick={() => alterarStatus(item.id, 'carregado')} className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 dark:border dark:border-amber-500/20 px-2.5 py-1.5 rounded-md active:scale-95 transition-all">
                          <Package size={12} /> Pegar
                        </button>
                      )}
                      {item.status === 'carregado' && (
                        <button onClick={() => alterarStatus(item.id, 'entregue')} className="flex items-center gap-1 text-[10px] font-bold text-white dark:text-white bg-emerald-500 dark:bg-emerald-600 px-2.5 py-1.5 rounded-md active:scale-95 transition-all shadow-sm dark:shadow-none">
                          <CheckCircle2 size={12} /> Entregar
                        </button>
                      )}
                      {item.status === 'entregue' && (
                        <button onClick={() => alterarStatus(item.id, 'carregado')} className="text-gray-400 dark:text-gray-400 p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md active:scale-95 transition-transform hover:bg-gray-50 dark:hover:bg-gray-700">
                          <Undo2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}