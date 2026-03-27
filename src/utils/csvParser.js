import Papa from 'papaparse';
import { generateId, getTodayDate } from './formatters';

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        try {
          const transactions = results.data.map((row) => {
            const desc = row['Descrição'] || row['descricao'] || row['description'] || row['DESCRICAO'] || '';
            const rawAmount = row['Valor'] || row['valor'] || row['amount'] || row['VALOR'] || '0';
            const date = row['Data'] || row['data'] || row['date'] || row['DATA'] || getTodayDate();
            const amount = parseFloat(
              rawAmount.replace(/[R$\s.]/g, '').replace(',', '.')
            );

            return {
              id: generateId(),
              description: desc.trim(),
              amount: Math.abs(amount),
              date: normalizeDate(date),
              type: amount < 0 ? 'expense' : 'income',
              paymentMethodId: '',
              accountId: '',
              tags: [],
              creditCardId: '',
              installments: 1,
              installmentNumber: 1,
              notes: 'Importado via CSV',
              createdAt: new Date().toISOString(),
            };
          }).filter(t => t.description && t.amount > 0);

          resolve(transactions);
        } catch (err) {
          reject(new Error('Erro ao processar CSV: ' + err.message));
        }
      },
      error: (err) => reject(new Error('Erro ao ler CSV: ' + err.message)),
    });
  });
};

const normalizeDate = (dateStr) => {
  if (!dateStr) return getTodayDate();
  // Try DD/MM/YYYY
  const brMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Try MM/DD/YYYY
  const usMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (usMatch) return `${usMatch[3]}-${usMatch[1]}-${usMatch[2]}`;
  return getTodayDate();
};

export const parseOFX = (content) => {
  try {
    const transactions = [];
    const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    let match;
    while ((match = stmtTrnRegex.exec(content)) !== null) {
      const block = match[1];
      const getValue = (tag) => {
        const r = new RegExp(`<${tag}>([^<\\n]+)`, 'i');
        const m = block.match(r);
        return m ? m[1].trim() : '';
      };
      const trnType = getValue('TRNTYPE');
      const datePosted = getValue('DTPOSTED');
      const amount = parseFloat(getValue('TRNAMT').replace(',', '.'));
      const memo = getValue('MEMO') || getValue('NAME');

      let date = getTodayDate();
      if (datePosted && datePosted.length >= 8) {
        date = `${datePosted.substr(0, 4)}-${datePosted.substr(4, 2)}-${datePosted.substr(6, 2)}`;
      }

      transactions.push({
        id: generateId(),
        description: memo || trnType,
        amount: Math.abs(amount),
        date,
        type: amount < 0 ? 'expense' : 'income',
        paymentMethodId: '',
        accountId: '',
        tags: [],
        creditCardId: '',
        installments: 1,
        installmentNumber: 1,
        notes: 'Importado via OFX',
        createdAt: new Date().toISOString(),
      });
    }
    return transactions;
  } catch (err) {
    throw new Error('Erro ao processar OFX: ' + err.message);
  }
};
