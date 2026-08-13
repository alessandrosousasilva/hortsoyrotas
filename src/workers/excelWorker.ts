import * as XLSX from 'xlsx';

self.onmessage = (e: MessageEvent) => {
  try {
    const { fileData } = e.data;
    
    // Lê o arquivo em binário
    const wb = XLSX.read(fileData, { type: 'binary' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    
    // Converte para JSON e já injeta o ID e Status inicial
    const data = XLSX.utils.sheet_to_json(ws).map((item: any, index: number) => ({
      ...item,
      id: `${Date.now()}-${index}`,
      status: 'pendente' 
    }));
    
    // Devolve os dados prontos para a thread principal
    self.postMessage({ success: true, data });
  } catch (error) {
    self.postMessage({ success: false, error: 'Falha ao processar a planilha' });
  }
};