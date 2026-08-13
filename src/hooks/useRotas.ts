import { useState, useMemo, useEffect } from 'react';
import { RotaItem, GrupoRota, StatusRota } from '../types';

export function useRotas() {
  const [rotas, setRotas] = useState<RotaItem[]>([]);
  const [filtroOrigem, setFiltroOrigem] = useState('');
  const [filtroDestino, setFiltroDestino] = useState('');

  // Carrega do LocalStorage na inicialização
  useEffect(() => {
    const rotasSalvas = localStorage.getItem('@hortsoy-rotas');
    if (rotasSalvas) {
      try {
        const dadosParseados: RotaItem[] = JSON.parse(rotasSalvas);
        setRotas(dadosParseados);
      } catch (erro) {
        console.error("Falha ao recuperar a rota salva.", erro);
      }
    }
  }, []);

  // Salva no LocalStorage sempre que 'rotas' mudar
  useEffect(() => {
    if (rotas.length > 0) {
      localStorage.setItem('@hortsoy-rotas', JSON.stringify(rotas));
    }
  }, [rotas]);

  const limparRotas = () => {
    setRotas([]);
    setFiltroOrigem('');
    setFiltroDestino('');
    localStorage.removeItem('@hortsoy-rotas');
  };

  const alterarStatus = (id: string, novoStatus: StatusRota) => {
    setRotas(prev => prev.map(rota => 
      rota.id === id ? { ...rota, status: novoStatus } : rota
    ));
  };

  const extrairNumero = (valor: string | number | undefined): number => {
    if (valor === undefined || valor === null || valor === '') return 0;
    if (typeof valor === 'number') return valor;
    let str = String(valor).trim();
    if (str.includes(',')) str = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(str) || 0;
  };

  const rotasFiltradas = useMemo(() => {
    return rotas.filter(r => {
      const matchOrigem = filtroOrigem ? r['FILIAL ORIGEM'] === filtroOrigem : true;
      const matchDestino = filtroDestino ? r['FILIAL DESTINO'] === filtroDestino : true;
      return matchOrigem && matchDestino;
    });
  }, [rotas, filtroOrigem, filtroDestino]);

  const rotasAgrupadas = useMemo(() => {
    const grupos: Record<string, GrupoRota> = {};
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
      grupos[chave].pesoTotalTrecho += extrairNumero(item['PESO KG/L']);
    });
    return Object.values(grupos);
  }, [rotasFiltradas]);

  return {
    rotas,
    setRotas,
    rotasFiltradas,
    rotasAgrupadas,
    filtroOrigem,
    setFiltroOrigem,
    filtroDestino,
    setFiltroDestino,
    alterarStatus,
    limparRotas,
    extrairNumero
  };
}