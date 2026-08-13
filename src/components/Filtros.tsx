import { Download } from 'lucide-react';

interface FiltrosProps {
  origens: string[];
  destinos: string[];
  filtroOrigem: string;
  setFiltroOrigem: (val: string) => void;
  filtroDestino: string;
  setFiltroDestino: (val: string) => void;
  onExportar: () => void;
}

export function Filtros({ origens, destinos, filtroOrigem, setFiltroOrigem, filtroDestino, setFiltroDestino, onExportar }: FiltrosProps) {
  return (
    <div className="w-full max-w-lg mx-auto px-2.5 pt-2.5 pb-3">
      <div className="w-full bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col gap-3 transition-colors duration-500">
        <div className="grid grid-cols-2 gap-3">
          <div className="w-full">
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Origem</label>
            <select 
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-colors duration-500"
              value={filtroOrigem}
              onChange={(e) => setFiltroOrigem(e.target.value)}
            >
              <option value="">Todas</option>
              {origens.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          
          <div className="w-full">
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Destino</label>
            <select 
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-colors duration-500"
              value={filtroDestino}
              onChange={(e) => setFiltroDestino(e.target.value)}
            >
              <option value="">Todos</option>
              {destinos.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <button 
          onClick={onExportar}
          className="w-full flex justify-center items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 py-2.5 rounded-lg text-xs font-bold active:bg-emerald-100 dark:active:bg-emerald-500/20 transition-colors duration-500"
        >
          <Download size={14} /> 
          {/* O span protege o texto dinâmico para evitar o erro NotFoundError do React */}
          <span>{(!filtroOrigem && !filtroDestino) ? 'Exportar Lista Original Completa' : 'Exportar Lista para Separação'}</span>
        </button>
      </div>
    </div>
  );
}