import React from 'react';
import { XCircle, Trash2 } from 'lucide-react';
import { RotaItem } from '../types';

const LISTA_UNIDADES = [
  'ARAXÁ', 'BAMBUÍ', 'CARMO R. CLARO', 'CONCEIÇÃO ALAGOAS', 'COROMANDEL',
  'IBIÁ', 'PASSOS', 'PATOS DE MINAS', 'PATROCÍNIO', 'PIUMHI',
  'SACRAMENTO', 'SANTA JULIANA', 'SÃO GOTARDO', 'UBERABA'
].sort();

interface ModalEdicaoProps {
  item: RotaItem;
  setItem: (item: RotaItem) => void;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onDelete: (id: string) => void;
  onQtdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ModalEdicao({ item, setItem, onClose, onSave, onDelete, onQtdChange }: ModalEdicaoProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-black text-gray-900 dark:text-white">Editar Carga</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XCircle size={20} />
          </button>
        </div>

        <form onSubmit={onSave} className="p-4 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Produto</label>
            <input 
              type="text" required autoFocus
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 text-sm font-bold text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 outline-none"
              value={item['PRODUTO']}
              onChange={(e) => setItem({ ...item, 'PRODUTO': e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Quantidade</label>
              <input 
                type="number" required min="1"
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 text-sm font-bold text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                value={item['QTD.']}
                onChange={onQtdChange}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Peso (KG) <span className="font-normal lowercase text-[9px]">(opcional)</span></label>
              <input 
                type="text" placeholder="0"
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 text-sm font-bold text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                value={item['PESO KG/L'] || ''}
                onChange={(e) => setItem({ ...item, 'PESO KG/L': e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Origem</label>
              <select 
                required
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                value={item['FILIAL ORIGEM']}
                onChange={(e) => setItem({ ...item, 'FILIAL ORIGEM': e.target.value })}
              >
                <option value="" disabled>Selecione...</option>
                {LISTA_UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Destino</label>
              <select 
                required
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                value={item['FILIAL DESTINO']}
                onChange={(e) => setItem({ ...item, 'FILIAL DESTINO': e.target.value })}
              >
                <option value="" disabled>Selecione...</option>
                {LISTA_UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Observação <span className="font-normal lowercase text-[9px]">(opcional)</span></label>
            <input 
              type="text" placeholder="Ex: Embalagem danificada"
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 text-xs font-medium text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 outline-none"
              value={item['OBS'] || ''}
              onChange={(e) => setItem({ ...item, 'OBS': e.target.value })}
            />
          </div>

          <div className="pt-3 flex gap-3 justify-end items-center border-t border-gray-100 dark:border-gray-800 mt-4">
            <button type="button" onClick={() => onDelete(item.id)} className="mr-auto flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
              <Trash2 size={14} /> Excluir
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:text-gray-950 active:scale-95 rounded-lg shadow-sm">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}