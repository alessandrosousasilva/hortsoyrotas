# 🚚 Painel Logístico - HortSoy

![Tech Stack](https://img.shields.io/badge/tech-React%20%7C%20Vite%20%7C%20Tailwind%20CSS%20%7C%20SheetJS-007acc?style=flat)

O **Painel Logístico HortSoy** é uma aplicação Web (PWA) desenvolvida para digitalizar e simplificar a operação de movimetações.

O intuito do projeto é eliminar o uso de papel. O motorista importa a planilha de cargas diretamente do celular e o sistema agrupa automaticamente os produtos por trecho (Origem ➔ Destino). A partir daí, pode realizar o checklist de carregamento e entrega, além de gerar listas de separação dinâmicas para cada unidade.

---

## ✨ Recursos Principais

- 📊 **Leitura Instantânea:** Upload de rotas diretamente de arquivos `.xlsx`.
- 📍 **Agrupamento Inteligente:** Cargas agrupadas por unidade de origem e destino com cálculo automático de peso do trecho.
- ✅ **Checklist de Viagem:** Controle interativo de status (`Pegar` ➔ `Entregar`) para cada produto.
- 💾 **Funcionamento Offline:** Dados e progresso da viagem salvos automaticamente na memória do celular (`localStorage`).
- 📥 **Exportação Inteligente:** Geração de arquivo Excel (Lista Original Completa ou Lista Resumida para Separação na unidade).
- 🌙 **Modo Escuro:** Alternância de tema claro/escuro para conforto visual.

---

## 📋 Modelo da Planilha (Excel)

Para que a leitura de dados funcione corretamente, o arquivo importado (`.xlsx` ou `.xls`) precisa conter os seguintes cabeçalhos na primeira linha:

| PRODUTO           | QTD. | PESO KG/L | FILIAL ORIGEM | FILIAL DESTINO | OBS        |
| :---------------- | :--- | :-------- | :------------ | :------------- | :--------- |
| Ex: ARIETE 100 EC | 19   | 99,75     | ARAXÁ         | BAMBUÍ         | nf emitida |

> ⚠️ **Atenção:** O sistema lê os nomes exatos das colunas. A coluna `OBS` é opcional em seu preenchimento, mas o cabeçalho deve existir.

---
