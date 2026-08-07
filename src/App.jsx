import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, MapPin, AlertCircle, Trash2, Package, CheckCircle2, Undo2, Weight, Download, Sun, Moon, Loader2, XCircle, Info } from 'lucide-react';

export default function App() {
  const [rotas, setRotas] = useState([]);
  const [filtroOrigem, setFiltroOrigem] = useState('');
  const [filtroDestino, setFiltroDestino] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [modalLimpar, setModalLimpar] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    const temaSalvo = localStorage.getItem('@hortsoy-tema');
    return temaSalvo === 'escuro';
  });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3500);
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('@hortsoy-tema', 'escuro');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('@hortsoy-tema', 'claro');
    }
  }, [isDark]);

  useEffect(() => {
    const rotasSalvas = localStorage.getItem('@hortsoy-rotas');
    if (rotasSalvas) {
      try {
        const dadosParseados = JSON.parse(rotasSalvas);
        const dadosCorrigidos = dadosParseados.map((item, index) => ({
          ...item,
          id: item.id || `migrado-${Date.now()}-${index}`,
          status: item.status || 'pendente'
        }));
        setRotas(dadosCorrigidos);
      } catch (erro) {
        console.error("Falha ao recuperar a rota salva do localStorage.", erro);
        showToast("Erro ao carregar rota salva.", "error");
      }
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);

    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          
          const data = XLSX.utils.sheet_to_json(ws).map((item, index) => ({
            ...item,
            id: `${Date.now()}-${index}`,
            status: 'pendente' 
          }));
          
          setRotas(data);
          localStorage.setItem('@hortsoy-rotas', JSON.stringify(data));
          showToast("Planilha carregada com sucesso!", "success");
        } catch (error) {
          showToast("Erro ao ler o arquivo. Verifique o formato.", "error");
        } finally {
          setIsLoading(false);
          e.target.value = '';
        }
      };
      reader.readAsBinaryString(file);
    }, 300);
  };

  // Função blindada contra "stale state"
  const alterarStatus = (id, novoStatus) => {
    setRotas(prevRotas => {
      const novasRotas = prevRotas.map(rota => 
        rota.id === id ? { ...rota, status: novoStatus } : rota
      );
      localStorage.setItem('@hortsoy-rotas', JSON.stringify(novasRotas));
      return novasRotas;
    });
  };

  const confirmarLimpeza = () => {
    setRotas([]);
    setFiltroOrigem('');
    setFiltroDestino('');
    localStorage.removeItem('@hortsoy-rotas');
    setModalLimpar(false);
    showToast("Rota finalizada e limpa.", "success");
  };

  const origens = useMemo(() => [...new Set(rotas.map(r => r['FILIAL ORIGEM']).filter(Boolean))].sort(), [rotas]);
  const destinos = useMemo(() => [...new Set(rotas.map(r => r['FILIAL DESTINO']).filter(Boolean))].sort(), [rotas]);

  const rotasFiltradas = useMemo(() => {
    return rotas.filter(r => {
      const matchOrigem = filtroOrigem ? r['FILIAL ORIGEM'] === filtroOrigem : true;
      const matchDestino = filtroDestino ? r['FILIAL DESTINO'] === filtroDestino : true;
      return matchOrigem && matchDestino;
    });
  }, [rotas, filtroOrigem, filtroDestino]);

  const exportarParaExcel = () => {
    if (rotasFiltradas.length === 0) {
      showToast("Nenhuma carga na tela para exportar.", "error");
      return;
    }

    const ehListaCompleta = !filtroOrigem && !filtroDestino;
    let dadosExportacao;
    let nomeArquivo;
    let nomeAba;

    if (ehListaCompleta) {
      dadosExportacao = rotasFiltradas.map(item => ({
        'PRODUTO': item['PRODUTO'],
        'QTD.': item['QTD.'],
        'PESO KG/L': item['PESO KG/L'],
        'FILIAL ORIGEM': item['FILIAL ORIGEM'],
        'FILIAL DESTINO': item['FILIAL DESTINO'],
        'OBS': item['OBS'] || ''
      }));
      nomeArquivo = 'Lista_Original_Completa.xlsx';
      nomeAba = 'Lista Completa';
    } else {
      dadosExportacao = rotasFiltradas.map(item => ({
        'PRODUTO': item['PRODUTO'],
        'QTD.': item['QTD.'],
        'ORIGEM': item['FILIAL ORIGEM'],
        'DESTINO': item['FILIAL DESTINO'],
        'OBS': item['OBS'] || ''
      }));
      
      const nomeOrigem = filtroOrigem ? filtroOrigem.replace(/\s+/g, '_') : 'Varias';
      const nomeDestino = filtroDestino ? filtroDestino.replace(/\s+/g, '_') : 'Varios';
      
      nomeArquivo = `Separacao_${nomeOrigem}_para_${nomeDestino}.xlsx`;
      nomeAba = 'Separacao';
    }

    const ws = XLSX.utils.json_to_sheet(dadosExportacao);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, nomeAba);
    XLSX.writeFile(wb, nomeArquivo);
    showToast("Planilha exportada com sucesso!", "success");
  };

  const pesoTotalGlobal = useMemo(() => {
    return rotasFiltradas.reduce((acc, curr) => {
      const pesoStr = String(curr['PESO KG/L'] || '0').replace(',', '.');
      return acc + (parseFloat(pesoStr) || 0);
    }, 0);
  }, [rotasFiltradas]);

  const rotasAgrupadas = useMemo(() => {
    const grupos = {};
    rotasFiltradas.forEach(item => {
      const chave = `${item['FILIAL ORIGEM']}-${item['FILIAL DESTINO']}`;
      
      if (!grupos[chave]) {
        grupos[chave] = {
          idGrupo: chave,
          origem: item['FILIAL ORIGEM'],
          destino: item['FILIAL DESTINO'],
          itens: [],
          pesoTotalTrecho: 0
        };
      }
      
      grupos[chave].itens.push(item);
      const pesoItem = parseFloat(String(item['PESO KG/L'] || '0').replace(',', '.')) || 0;
      grupos[chave].pesoTotalTrecho += pesoItem;
    });
    
    return Object.values(grupos);
  }, [rotasFiltradas]);

  const progresso = useMemo(() => {
    const carregados = rotas.filter(r => r.status === 'carregado').length;
    const entregues = rotas.filter(r => r.status === 'entregue').length;
    return { carregados, entregues, total: rotas.length };
  }, [rotas]);

  return (
    // Fundo mais escuro (gray-950) para dar profundidade ao modo dark
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-500 pb-10 font-sans text-gray-800 dark:text-gray-100 relative">
      
      {/* TOAST NOTIFICATION */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-bold backdrop-blur-md
          ${toast.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-700 dark:bg-red-950/90 dark:border-red-900 dark:text-red-400' : 
            toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700 dark:bg-emerald-950/90 dark:border-emerald-900 dark:text-emerald-400' : 
            'bg-gray-50/90 border-gray-200 text-gray-700 dark:bg-gray-900/90 dark:border-gray-800 dark:text-gray-200'}`}
        >
          {toast.type === 'error' ? <XCircle size={18} /> : toast.type === 'success' ? <CheckCircle2 size={18} /> : <Info size={18} />}
          {toast.message}
        </div>
      </div>

      {/* MODAL DE LIMPEZA */}
      {modalLimpar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/70 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Limpar rota atual?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Esta ação apagará todo o progresso atual. Você precisará carregar uma nova planilha para continuar.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-950 px-5 py-4 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={() => setModalLimpar(false)}
                className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarLimpeza}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 active:scale-95 rounded-lg transition-all shadow-sm"
              >
                Sim, limpar tudo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAINEL SUPERIOR FIXO */}
      <div className="sticky top-0 z-20 w-full bg-gray-100 dark:bg-gray-950 transition-colors duration-500 shadow-md dark:shadow-none dark:border-b dark:border-gray-900">
        <header className="bg-white dark:bg-gray-900 px-3 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center transition-colors duration-500">
          <div className="flex items-center">
            <img src="/logo-hortsoy.png" alt="HortSoy" className={`h-8 object-contain transition-all duration-500 ${isDark ? 'brightness-[150%] hue-rotate-15 opacity-90' : ''}`} />
          </div>
          
          <div className="flex items-center gap-2.5">
            {rotas.length > 0 && (
              <div className="text-right flex gap-2.5">
                <div className="border-r border-gray-200 dark:border-gray-800 pr-2.5 transition-colors duration-500">
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider leading-none mb-0.5">Peso Total</p>
                  <p className="text-sm font-black text-gray-800 dark:text-gray-200 leading-none transition-colors duration-500">{pesoTotalGlobal.toLocaleString('pt-BR')} kg</p>
                </div>
                
                <div>
                  <p className="text-[9px] text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider leading-none mb-0.5">Caminhão</p>
                  <p className="text-sm font-extrabold text-gray-800 dark:text-gray-200 leading-none text-center transition-colors duration-500">{progresso.carregados}</p>
                </div>
                <div>
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-wider leading-none mb-0.5">Entregues</p>
                  <p className="text-sm font-extrabold text-gray-800 dark:text-gray-200 leading-none text-center transition-colors duration-500">{progresso.entregues}/{progresso.total}</p>
                </div>
              </div>
            )}

            <button 
              onClick={() => setIsDark(!isDark)} 
              className="text-gray-400 dark:text-gray-500 hover:text-emerald-500 dark:hover:text-emerald-400 active:scale-95 transition-all p-1"
              title="Alternar Modo Escuro"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {rotas.length > 0 && (
              <button 
                onClick={() => setModalLimpar(true)} 
                className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 active:scale-95 transition-all p-1"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </header>

        {rotas.length > 0 && (
          <div className="px-2.5 pt-2.5 pb-3 max-w-lg mx-auto">
            <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col gap-2.5 transition-colors duration-500">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Origem</label>
                  <select 
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-2 text-xs font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-colors duration-500"
                    value={filtroOrigem}
                    onChange={(e) => setFiltroOrigem(e.target.value)}
                  >
                    <option value="">Todas</option>
                    {origens.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Destino</label>
                  <select 
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-2 text-xs font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-colors duration-500"
                    value={filtroDestino}
                    onChange={(e) => setFiltroDestino(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {destinos.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={exportarParaExcel}
                className="w-full flex justify-center items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 py-2 rounded-lg text-xs font-bold active:bg-emerald-100 dark:active:bg-emerald-500/20 transition-colors duration-500"
              >
                <Download size={14} /> 
                {(!filtroOrigem && !filtroDestino) ? 'Exportar Lista Original Completa' : 'Exportar Lista para Separação'}
              </button>
            </div>
          </div>
        )}
      </div>

      <main className="p-2.5 max-w-lg mx-auto">
        {rotas.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-500">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-full mb-4 transition-colors duration-500">
              {isLoading ? (
                <Loader2 size={40} className="text-emerald-600 dark:text-emerald-400 animate-spin" />
              ) : (
                <UploadCloud size={40} className="text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 transition-colors duration-500">
              {isLoading ? 'Processando...' : 'Painel Logístico'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6 transition-colors duration-500">
              {isLoading ? 'Lendo linhas da planilha, aguarde.' : 'Selecione a planilha de rotas para carregar as entregas.'}
            </p>
            
            <label className={`w-full text-center text-sm px-6 py-3 rounded-xl font-bold transition-all duration-200 ${isLoading ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-emerald-600 dark:bg-emerald-500/20 text-white dark:text-emerald-400 dark:border dark:border-emerald-500/30 shadow-md shadow-emerald-600/30 dark:shadow-none cursor-pointer hover:bg-emerald-700 dark:hover:bg-emerald-500/30 active:scale-95'}`}>
              Carregar Planilha
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} disabled={isLoading} />
            </label>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {rotasAgrupadas.map((grupo) => (
              <div key={grupo.idGrupo} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-500">
                
                {/* Cabecalho do Card Logístico */}
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 border-b border-emerald-100 dark:border-gray-800 flex items-center justify-between transition-colors duration-500">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-gray-700 dark:text-gray-200">
                    <MapPin size={16} className="text-emerald-600 dark:text-emerald-500 shrink-0" />
                    <span className="truncate max-w-[100px]">{grupo.origem}</span>
                    <span className="text-emerald-300 dark:text-gray-600 font-normal">➔</span>
                    <span className="truncate max-w-[100px] text-emerald-800 dark:text-emerald-400">{grupo.destino}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-200/50 dark:bg-emerald-500/10 dark:border dark:border-emerald-500/20 px-2 py-0.5 rounded-full whitespace-nowrap transition-colors duration-500">
                      <Weight size={10} />
                      {grupo.pesoTotalTrecho.toLocaleString('pt-BR')} kg
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-gray-300 bg-emerald-100 dark:bg-gray-800 px-2 py-0.5 rounded-full whitespace-nowrap transition-colors duration-500">
                      {grupo.itens.length} {grupo.itens.length > 1 ? 'itens' : 'item'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col">
                  {grupo.itens.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-2.5 border-b border-gray-100 dark:border-gray-800 last:border-none flex justify-between items-center gap-2 transition-all duration-300
                        ${item.status === 'carregado' ? 'bg-amber-50/60 dark:bg-amber-500/5' : ''} 
                        ${item.status === 'entregue' ? 'bg-gray-50/80 dark:bg-gray-950/50 opacity-100 dark:opacity-60 grayscale-[40%] dark:grayscale' : ''}`}
                    >
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-start gap-1.5">
                          <span className={`font-black text-xs ${item.status === 'entregue' ? 'text-gray-400 dark:text-gray-500' : 'text-emerald-600 dark:text-emerald-500'}`}>
                            {item['QTD.']}x
                          </span>
                          <h3 className={`font-bold text-[11px] leading-tight truncate ${item.status === 'entregue' ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                            {item['PRODUTO']}
                          </h3>
                        </div>
                        
                        {item['OBS'] && String(item['OBS']).trim() !== '' && (
                          <div className="mt-1 flex">
                            <div className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1 py-0.5 rounded inline-flex items-center gap-1 border border-amber-100 dark:border-amber-500/20">
                              <AlertCircle size={10} className="shrink-0" />
                              <span className="truncate max-w-[150px] uppercase">{item['OBS']}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center">
                        {item.status === 'pendente' && (
                          <button 
                            onClick={() => alterarStatus(item.id, 'carregado')}
                            className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 dark:border dark:border-amber-500/20 px-2.5 py-1.5 rounded-md active:scale-95 transition-all"
                          >
                            <Package size={12} /> Pegar
                          </button>
                        )}
                        
                        {item.status === 'carregado' && (
                          <button 
                            onClick={() => alterarStatus(item.id, 'entregue')}
                            className="flex items-center gap-1 text-[10px] font-bold text-white dark:text-emerald-400 bg-emerald-500 dark:bg-emerald-500/10 dark:border dark:border-emerald-500/20 px-2.5 py-1.5 rounded-md active:scale-95 transition-all shadow-sm dark:shadow-none"
                          >
                            <CheckCircle2 size={12} /> Entregar
                          </button>
                        )}

                        {item.status === 'entregue' && (
                          <button 
                            onClick={() => alterarStatus(item.id, 'carregado')}
                            className="text-gray-400 dark:text-gray-500 p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md active:scale-95 transition-transform hover:bg-gray-50 dark:hover:bg-gray-800"
                            title="Desfazer entrega"
                          >
                            <Undo2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {rotasAgrupadas.length === 0 && (
              <div className="text-center p-6 text-sm font-medium text-gray-400 dark:text-gray-600 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 mt-2 transition-colors duration-500">
                Nenhuma carga encontrada para este trajeto.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}