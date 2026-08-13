import { Sun, Moon, Trash2 } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  temRotas: boolean;
  pesoTotal: number;
  pesoCaminhao: number;
  carregados: number;
  entregues: number;
  totalItens: number;
  onLimpar: () => void;
}

export function Header({ isDark, toggleTheme, temRotas, pesoTotal, pesoCaminhao, carregados, entregues, totalItens, onLimpar }: HeaderProps) {
  return (
    <div className="sticky top-0 z-20 w-full bg-gray-100 dark:bg-gray-950 transition-colors duration-500 shadow-md dark:shadow-none dark:border-b dark:border-gray-800">
      <header className="bg-white dark:bg-gray-900 px-3 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center transition-colors duration-500">
        <div className="flex items-center">
          <img src="/logo-hortsoy.png" alt="HortSoy" className={`h-8 object-contain transition-all duration-500 ${isDark ? 'brightness-[150%] hue-rotate-15 opacity-90' : ''}`} />
        </div>
        
        <div className="flex items-center gap-2.5">
          {temRotas && (
            <div className="text-right flex items-start gap-2.5">
              <div className="border-r border-gray-200 dark:border-gray-700 pr-2.5 transition-colors duration-500">
                <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider leading-none mb-0.5">Peso Total</p>
                <p className="text-sm font-black text-gray-800 dark:text-gray-200 leading-none transition-colors duration-500">
                  {/* Blindagem: (pesoTotal || 0) */}
                  {(pesoTotal || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <p className="text-[9px] text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider leading-none mb-1">Caminhão</p>
                <div className="flex flex-col items-center gap-0.5">
                  <p className="text-sm font-extrabold text-gray-800 dark:text-gray-200 leading-none transition-colors duration-500">
                    {carregados}
                  </p>
                  <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1 py-0.5 rounded leading-none">
                    {/* Blindagem: (pesoCaminhao || 0) */}
                    {(pesoCaminhao || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-center pl-1">
                <p className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-wider leading-none mb-1">Entregues</p>
                <p className="text-sm font-extrabold text-gray-800 dark:text-gray-200 leading-none transition-colors duration-500 mt-0.5">
                  {entregues}/{totalItens}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center ml-1">
            <button onClick={toggleTheme} className="text-gray-400 dark:text-gray-500 hover:text-emerald-500 dark:hover:text-emerald-400 active:scale-95 transition-all p-1" title="Alternar Modo Escuro">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {temRotas && (
              <button onClick={onLimpar} className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 active:scale-95 transition-all p-1">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}