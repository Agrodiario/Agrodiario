/**
 * Valida um número de Cadastro de Pessoa Física (CPF).
 * @param cpf O CPF a ser validado, pode ser formatado ou sem formatação.
 * @returns true se o CPF for válido, false caso contrário.
 */
export function validateCpf(cpf: string): boolean {
  // 1. Remove caracteres não numéricos
  const cleanCpf = cpf.replace(/[^\d]/g, '');

  if (cleanCpf.length !== 11 || /^(\d)\1{10}$/.test(cleanCpf)) {
    return false;
  }

  let sum: number;
  let remainder: number;

  const validateDigit = (sliceLength: number, digitIndex: number): boolean => {
    sum = 0;
    for (let i = 0; i < sliceLength; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (sliceLength + 1 - i);
    }

    remainder = sum % 11;
    let expectedDigit = remainder < 2 ? 0 : 11 - remainder;

    return expectedDigit === parseInt(cleanCpf.charAt(digitIndex));
  };

  // 4. Valida o primeiro dígito verificador
  if (!validateDigit(9, 9)) {
    return false;
  }

  // 5. Valida o segundo dígito verificador
  if (!validateDigit(10, 10)) {
    return false;
  }

  return true;
}

/**
 * Verifica se uma string DD/MM/AAAA é uma data real e com formato correto.
 * @param dateString A data no formato DD/MM/AAAA.
 * @returns true se for uma data válida, false caso contrário.
 */
export function isValidDate(dateString: string): boolean {
  const parts = dateString.split('/');
  if (parts.length !== 3) return false;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month - 1, day);

  return (
    !isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day &&
    year > 1900 // Ano mínimo razoável
  );
}

export const isValidNumber = (value: string): boolean => {
  // Permite números inteiros e decimais com ponto ou vírgula
  return /^[0-9]+([.,][0-9]+)?$/.test(value);
};

export const validateNumberField = (value: string, fieldName: string): string => {
  if (!value || value.trim() === '') {
    return `${fieldName} é obrigatório`;
  }

  if (!isValidNumber(value)) {
    return `${fieldName} deve conter apenas números`;
  }

  // Converte para número para verificar se é positivo
  const numValue = parseFloat(value.replace(',', '.'));
  if (numValue <= 0) {
    return `${fieldName} deve ser maior que zero`;
  }

  return '';
};