import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, CheckCircle2, Loader2, XCircle, AlertCircle } from 'lucide-react';

import { useRotas } from './hooks/useRotas';
import { Header } from './components/Header';
import { Filtros } from './components/Filtros';
import { ListaRotas } from './components/ListaRotas';
import { ModalEdicao } from './components/ModalEdicao';
import { RotaItem } from './types';

import ExcelWorker from './workers/excelWorker?worker';

export default function App() {
  const {
    rotas, setRotas, rotasFiltradas, rotasAgrupadas,
    filtroOrigem, setFiltroOrigem, filtroDestino, setFiltroDestino,
    alterarStatus, limparRotas, extrairNumero
  } = useRotas();

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [modalLimpar, setModalLimpar] = useState(false);
  
  // Estado restaurado: Modal de conclusão
  const [modalRotaFinalizada, setModalRotaFinalizada] = useState(false);
  const [modalItem, setModalItem] = useState<{ show: boolean, data: RotaItem | null }>({ show: false, data: null });
  const [isDark, setIsDark] = useState(() => localStorage.getItem('@hortsoy-tema') === 'escuro');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('@hortsoy-tema', isDark ? 'escuro' : 'claro');
  }, [isDark]);

  const showToast = (message: string, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      
      const worker = new ExcelWorker();
      worker.postMessage({ fileData: bstr });
      
      worker.onmessage = (event: MessageEvent) => {
        const { success, data, error } = event.data;
        if (success) {
          setRotas(data);
          showToast("Planilha carregada com sucesso!", "success");
        } else {
          showToast(error, "error");
        }
        setIsLoading(false);
        worker.terminate(); 
        e.target.value = '';
      };
    };
    reader.readAsBinaryString(file);
  };

  const exportarParaExcel = () => {
    if (rotasFiltradas.length === 0) return showToast("Nenhuma carga na tela para exportar.", "error");

    const ehListaCompleta = !filtroOrigem && !filtroDestino;
    
    const dadosExportacao = rotasFiltradas.map(item => {
      if (ehListaCompleta) {
        return {
          'PRODUTO': item['PRODUTO'],
          'QTD.': item['QTD.'],
          'PESO KG/L': item['PESO KG/L'],
          'FILIAL ORIGEM': item['FILIAL ORIGEM'],
          'FILIAL DESTINO': item['FILIAL DESTINO'],
          // Exporta o status em maiúsculo (PENDENTE, CARREGADO, ENTREGUE) apenas na lista completa
          'STATUS': item.status.toUpperCase(), 
          'OBS': item['OBS'] || ''
        };
      } else {
        return {
          'PRODUTO': item['PRODUTO'],
          'QTD.': item['QTD.'],
          'ORIGEM': item['FILIAL ORIGEM'],
          'DESTINO': item['FILIAL DESTINO'],
          'OBS': item['OBS'] || ''
        };
      }
    });

    const ws = XLSX.utils.json_to_sheet(dadosExportacao);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, ehListaCompleta ? "Lista Completa" : "Separacao");
    
    const nomeArquivo = ehListaCompleta 
      ? `Lista_Original_Completa.xlsx` 
      : `Separacao_${filtroOrigem || 'Varias'}_para_${filtroDestino || 'Varios'}.xlsx`;

    XLSX.writeFile(wb, nomeArquivo);
    showToast("Planilha exportada com sucesso!", "success");
  };

  const handleQtdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!modalItem.data) return;
    
    const novaQtdRaw = e.target.value;
    const numNovaQtd = parseInt(novaQtdRaw, 10);
    
    let newData = { ...modalItem.data, 'QTD.': novaQtdRaw };
    
    // Busca o item original na lista de rotas 
    const rotaOriginal = rotas.find(r => r.id === modalItem.data!.id);
    
    if (rotaOriginal) {
      const numQtdOriginal = parseInt(String(rotaOriginal['QTD.']), 10);
      const pesoOriginal = extrairNumero(rotaOriginal['PESO KG/L']);
      
      // Se a nova quantidade digitada for válida (maior que zero)
      if (!isNaN(numNovaQtd) && numNovaQtd > 0 && !isNaN(numQtdOriginal) && numQtdOriginal > 0) {
        // Calcula o valor unitário SEMPRE baseado na planilha original
        const pesoUnitario = pesoOriginal / numQtdOriginal;
        const novoPeso = (pesoUnitario * numNovaQtd);
        
        newData['PESO KG/L'] = Number.isInteger(novoPeso) 
          ? novoPeso.toString() 
          : novoPeso.toFixed(2).replace('.', ',');
      } 
      // Se o usuário apagou todo o campo para digitar outro número, limpamos o peso
      else if (isNaN(numNovaQtd) || numNovaQtd === 0) {
        newData['PESO KG/L'] = '';
      }
    }
    
    setModalItem({ ...modalItem, data: newData });
  };

  const salvarItem = (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!modalItem.data || !modalItem.data['PRODUTO'].trim()) {
      return showToast("O nome do produto é obrigatório.", "error");
    }

    setRotas(prevRotas => {
      const novasRotas = prevRotas.map(rota => rota.id === modalItem.data!.id ? modalItem.data! : rota);
      localStorage.setItem('@hortsoy-rotas', JSON.stringify(novasRotas));
      return novasRotas;
    });

    setModalItem({ show: false, data: null });
    showToast("Carga atualizada!", "success");
  };

  const excluirItem = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta carga da viagem?')) {
      setRotas(prevRotas => {
        const novasRotas = prevRotas.filter(rota => rota.id !== id);
        localStorage.setItem('@hortsoy-rotas', JSON.stringify(novasRotas));
        return novasRotas;
      });
      setModalItem({ show: false, data: null });
      showToast("Carga excluída com sucesso.", "success");
    }
  };

  const confirmarLimpeza = () => {
    limparRotas();
    setModalLimpar(false);
    setModalRotaFinalizada(false); // Limpa também o modal de finalização
    showToast("Rota finalizada e limpa.", "success");
  };

  const origens = useMemo(() => [...new Set(rotas.map(r => r['FILIAL ORIGEM']).filter(Boolean))].sort(), [rotas]);
  const destinos = useMemo(() => [...new Set(rotas.map(r => r['FILIAL DESTINO']).filter(Boolean))].sort(), [rotas]);

  const pesoTotalGlobal = rotasFiltradas.reduce((acc, curr) => acc + extrairNumero(curr['PESO KG/L']), 0);
  const progresso = {
    carregados: rotas.filter(r => r.status === 'carregado').length,
    entregues: rotas.filter(r => r.status === 'entregue').length,
    total: rotas.length,
    // Cálculo do peso atual no caminhão
    pesoCaminhao: rotas.filter(r => r.status === 'carregado').reduce((acc, curr) => acc + extrairNumero(curr['PESO KG/L']), 0)
  };

  useEffect(() => {
    if (progresso.total > 0 && progresso.entregues === progresso.total) {
      const timer = setTimeout(() => setModalRotaFinalizada(true), 600);
      return () => clearTimeout(timer);
    }
  }, [progresso.entregues, progresso.total]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-500 font-sans text-gray-800 dark:text-gray-100 relative flex flex-col">
      
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-bold backdrop-blur-md ${toast.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-700 dark:bg-red-950/90 dark:border-red-900 dark:text-red-400' : 'bg-emerald-50/90 border-emerald-200 text-emerald-700 dark:bg-emerald-950/90 dark:border-emerald-900 dark:text-emerald-400'}`}>
          {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      </div>

      <Header 
        isDark={isDark} 
        toggleTheme={() => setIsDark(!isDark)} 
        temRotas={rotas.length > 0} 
        pesoTotal={pesoTotalGlobal} 
        pesoCaminhao={progresso.pesoCaminhao} 
        carregados={progresso.carregados} 
        entregues={progresso.entregues} 
        totalItens={progresso.total} 
        onLimpar={() => setModalLimpar(true)} 
      />

      {rotas.length > 0 && (
        <Filtros 
          origens={origens} destinos={destinos} 
          filtroOrigem={filtroOrigem} setFiltroOrigem={setFiltroOrigem} 
          filtroDestino={filtroDestino} setFiltroDestino={setFiltroDestino} 
          onExportar={exportarParaExcel} 
        />
      )}

      <main className="flex-1 w-full max-w-lg mx-auto overflow-hidden px-2.5">
        {rotas.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-500">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-full mb-4 transition-colors duration-500">
              {isLoading ? <Loader2 size={40} className="text-emerald-600 dark:text-emerald-400 animate-spin" /> : <UploadCloud size={40} className="text-emerald-600 dark:text-emerald-400" />}
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 transition-colors duration-500">
              <span>{isLoading ? 'Processando...' : 'Painel Logístico'}</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6 transition-colors duration-500">
              <span>{isLoading ? 'Lendo planilhas de alta densidade, aguarde.' : 'Selecione a planilha de rotas para carregar as entregas.'}</span>
            </p>
            <label className={`w-full text-center text-sm px-6 py-3 rounded-xl font-bold transition-all duration-200 ${isLoading ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 dark:shadow-none cursor-pointer hover:bg-emerald-700 active:scale-95'}`}>
              Carregar Planilha
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} disabled={isLoading} />
            </label>
          </div>
        ) : (
          <ListaRotas 
            grupos={rotasAgrupadas} 
            alterarStatus={alterarStatus} 
            abrirModalEditar={(item) => setModalItem({ show: true, data: { ...item } })} 
          />
        )}
      </main>

      {/* Rota Finalizada */}
      {modalRotaFinalizada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/70 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Viagem Concluída! 🎉</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Todas as cargas foram entregues. Deseja limpar o painel para iniciar uma nova rota?
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-950 px-5 py-4 flex gap-3 justify-center border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={() => setModalRotaFinalizada(false)}
                className="flex-1 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Manter na tela
              </button>
              <button 
                onClick={confirmarLimpeza}
                className="flex-1 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:text-gray-950 active:scale-95 rounded-lg transition-all shadow-sm"
              >
                Limpar Rota
              </button>
            </div>
          </div>
        </div>
      )}

      {modalLimpar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/70 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Corpo do Modal: Ícone, Título e Descrição */}
            <div className="p-5 sm:p-6 text-left">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={22} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
                Limpar rota atual?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Esta ação apagará todo o progresso atual. <br />
                Você precisará carregar uma nova planilha.
              </p>
            </div>

            {/* Rodapé: Botões com fundo levemente cinza */}
            <div className="bg-gray-50 dark:bg-gray-950/50 px-5 py-4 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={() => setModalLimpar(false)} 
                className="px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarLimpeza} 
                className="px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 active:scale-95 rounded-lg transition-all shadow-sm"
              >
                Sim, limpar tudo
              </button>
            </div>
            
          </div>
        </div>
      )}

      {modalItem.show && modalItem.data && (
        <ModalEdicao 
          item={modalItem.data} 
          setItem={(novoItem) => setModalItem({ ...modalItem, data: novoItem })} 
          onClose={() => setModalItem({ show: false, data: null })} 
          onSave={salvarItem} 
          onDelete={excluirItem} 
          onQtdChange={handleQtdChange} 
        />
      )}
    </div>
  );
}