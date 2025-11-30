// src/utils/generatePDF.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActivityDTO } from '../services/activityService';
import { Property as PropertyResponseDTO } from '../types/property.types';

import logo from '@/assets/logo-grande.png';

// ------------------------------
// Função para converter imagem para Base64 + obter proporção
// ------------------------------
const loadImageAsBase64 = (
  url: string
): Promise<{ base64: string; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject("Canvas não suportado");

      ctx.drawImage(img, 0, 0);

      resolve({
        base64: canvas.toDataURL('image/png'),
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = reject;
  });
};

// =====================================
// RELATÓRIO DE ATIVIDADES
// =====================================
export const generateActivityReport = async (
  activities: ActivityDTO[],
  filterDescription?: string
) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');

  // 🔹 Carregar logo proporcional
  const { base64, width, height } = await loadImageAsBase64(logo);
  const targetWidth = 28; // ajuste aqui
  const targetHeight = (height / width) * targetWidth;

  // 🔹 Inserir logo no canto superior direito
  doc.addImage(base64, 'PNG', 255, 5, targetWidth, targetHeight);

  const colorPrimary = '#008542';
  const colorSecondary = '#e3f4e9';

  doc.setFontSize(18);
  doc.setTextColor(colorPrimary);
  doc.text('Relatório de Atividades - AgroDiário', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  const today = new Date().toLocaleDateString('pt-BR');
  doc.text(`Gerado em: ${today}`, 14, 30);

  if (filterDescription) {
    doc.text(`Filtro aplicado: ${filterDescription}`, 14, 35);
  }

  doc.setDrawColor(200);
  doc.line(14, 38, 283, 38);

  const tableColumn = [
    "Data",
    "Atividade / Operação",
    "Propriedade",
    "Responsável",
    "Insumos Utilizados",
    "Descrição"
  ];

  const tableRows = activities.map(item => {
    const dataFormatada = new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    const tituloOperacao = `${item.titulo || item.tipo.toUpperCase()}\n(${item.operacao || 'Sem detalhes'})`;

    const insumos = item.insumoNome
      ? `${item.insumoNome}\n${item.insumoQuantidade || ''} ${item.insumoUnidade || ''}`
      : '-';

    return [
      dataFormatada,
      tituloOperacao,
      item.propriedade,
      item.responsavel,
      insumos,
      item.descricao || '-'
    ];
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      valign: 'middle',
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: colorPrimary,
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 50 },
      2: { cellWidth: 40 },
      3: { cellWidth: 35 },
      4: { cellWidth: 40 },
      5: { cellWidth: 'auto' }
    },
    alternateRowStyles: {
      fillColor: colorSecondary,
    },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`agrodiario_relatorio_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// =====================================
// RELATÓRIO DE PROPRIEDADES
// =====================================
export const generatePropertyReport = async (
  properties: PropertyResponseDTO[],
  filterDescription?: string
) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');

  // 🔹 Carregar logo proporcional
  const { base64, width, height } = await loadImageAsBase64(logo);
  const targetWidth = 28; // ajuste aqui
  const targetHeight = (height / width) * targetWidth;

  // 🔹 Inserir logo
  doc.addImage(base64, 'PNG', 255, 5, targetWidth, targetHeight);

  const colorPrimary = '#008542';
  const colorSecondary = '#e3f4e9';

  doc.setFontSize(18);
  doc.setTextColor(colorPrimary);
  doc.text('Relatório de Propriedades - AgroDiário', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  const today = new Date().toLocaleDateString('pt-BR');
  doc.text(`Gerado em: ${today}`, 14, 30);

  if (filterDescription) {
    doc.text(`Filtro aplicado: ${filterDescription}`, 14, 35);
  }

  doc.setDrawColor(200);
  doc.line(14, 38, 283, 38);

  const tableColumn = [
    "Nome",
    "Endereço",
    "Área Total (ha)",
    "Área Prod. (ha)",
    "Cultivo Principal",
    "Certificações",
    "Data de Criação"
  ];

  const tableRows = properties.map(item => {
    const areaTotal = item.totalArea ? `${Number(item.totalArea).toFixed(2)}` : 'N/A';
    const areaProducao = item.productionArea ? `${Number(item.productionArea).toFixed(2)}` : 'N/A';
    const certificacoes = item.certifications || '-';
    const dataCriacao = item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : '-';

    return [
      item.name,
      item.address,
      areaTotal,
      areaProducao,
      item.mainCrop,
      certificacoes,
      dataCriacao
    ];
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 2,
      valign: 'middle',
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: colorPrimary,
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 70 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 35 },
      5: { cellWidth: 50 },
      6: { cellWidth: 25, halign: 'center' }
    },
    alternateRowStyles: {
      fillColor: colorSecondary,
    },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`agrodiario_relatorio_propriedades_${new Date().toISOString().slice(0, 10)}.pdf`);
};
