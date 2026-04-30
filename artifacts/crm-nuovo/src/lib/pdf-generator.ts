import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Quote, QuoteItem, Contact, Company } from '@/types';

export const generateQuotePDF = (quote: Quote, client?: Contact | Company) => {
  const doc = new jsPDF();
  const clientName = client ? ('firstName' in client ? `${client.firstName} ${client.lastName}` : client.name) : 'Cliente Nexus';

  // Header
  doc.setFontSize(20);
  doc.setTextColor(47, 198, 246); // Nexus Blue
  doc.text('PREVENTIVO', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`N. Preventivo: ${quote.id.substring(0, 8).toUpperCase()}`, 14, 40);
  doc.text(`Data: ${new Date(quote.data_creazione?.seconds * 1000 || Date.now()).toLocaleDateString()}`, 14, 45);
  if (quote.data_scadenza) {
    doc.text(`Scadenza: ${new Date(quote.data_scadenza?.seconds * 1000 || quote.data_scadenza).toLocaleDateString()}`, 14, 50);
  }

  // Client Info
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Destinatario:', 140, 40);
  doc.setFontSize(10);
  doc.text(clientName, 140, 45);
  if (client && 'email' in client) doc.text(client.email || '', 140, 50);
  if (client && 'phone' in client) doc.text(client.phone || '', 140, 55);

  // Title & Description
  doc.setFontSize(14);
  doc.text(quote.titolo, 14, 70);
  doc.setFontSize(10);
  doc.setTextColor(100);
  if (quote.descrizione) {
    doc.text(quote.descrizione, 14, 78, { maxWidth: 180 });
  }

  // Items Table
  const allItems = [...(quote.prodotti || []), ...(quote.servizi || [])];
  const tableData = allItems.map(item => [
    item.description,
    item.quantity.toString(),
    item.unit || 'cad.',
    `${item.price.toFixed(2)} ${quote.valuta}`,
    `${item.discount || 0}%`,
    `${item.tax}%`,
    `${item.total.toFixed(2)} ${quote.valuta}`
  ]);

  (doc as any).autoTable({
    startY: 90,
    head: [['Descrizione', 'Qtà', 'Unità', 'Prezzo Unit.', 'Sconto', 'IVA', 'Totale']],
    body: tableData,
    headStyles: { fillColor: [47, 198, 246] },
    alternateRowStyles: { fillColor: [245, 247, 251] },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`TOTALE: ${quote.totale.toFixed(2)} ${quote.valuta}`, 196, finalY, { align: 'right' });

  // Payment & Validity Info
  let currentY = finalY + 20;
  doc.setFontSize(10);
  doc.setTextColor(0);
  
  if (quote.termini_pagamento) {
    doc.text(`Termini di pagamento: ${quote.termini_pagamento}`, 14, currentY);
    currentY += 7;
  }
  if (quote.iban) {
    doc.text(`IBAN: ${quote.iban}`, 14, currentY);
    currentY += 7;
  }
  if (quote.validita) {
    doc.text(`Validità offerta: ${quote.validita}`, 14, currentY);
    currentY += 7;
  }

  // Notes
  if (quote.note) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Note:', 14, currentY + 5);
    doc.text(quote.note, 14, currentY + 13, { maxWidth: 180 });
  }

  // Footer
  doc.setFontSize(8);
  doc.text('Generato da Nexus CRM', 105, 285, { align: 'center' });

  doc.save(`Preventivo_${quote.id.substring(0, 8)}.pdf`);
};
