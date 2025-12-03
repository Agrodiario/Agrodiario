// src/utils/masks.ts

// Remove todos os caracteres que não são dígitos
const clean = (value: string) => {
  return value.replace(/\D/g, '');
};

export const cpfMask = (value: string) => {
  return clean(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2');
};

export const dateMask = (value: string) => {
  return clean(value)
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d{1,4})/, '$1/$2');
};

export const phoneMask = (value: string) => {
  const cleaned = clean(value).slice(0, 11);
  if (cleaned.length <= 10) {
    // Fixo (XX) XXXX-XXXX
    return cleaned
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})/, '$1-$2');
  } else {
    // Celular (XX) XXXXX-XXXX
    return cleaned
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})/, '$1-$2');
  }
};

export const numberMask = (value: string): string => {
  // Remove tudo que não é número, ponto ou vírgula
  let cleaned = value.replace(/[^\d,.]/g, '');

  // Substitui múltiplos pontos/vírgulas por apenas um
  cleaned = cleaned.replace(/([.,])(?=.*[.,])/g, '');

  // Se houver vírgula, converte para ponto para validação
  if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  }

  // Permite apenas dois decimais
  const parts = cleaned.split('.');
  if (parts.length > 1) {
    cleaned = `${parts[0]}.${parts[1].slice(0, 2)}`;
  }

  // Para exibição, converte ponto de volta para vírgula
  return cleaned.replace('.', ',');
};