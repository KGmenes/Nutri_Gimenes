export function formatPhone(val: string): string {
  if (!val) return '';
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length > 0 ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function formatTimeInput(val: string): string {
  if (!val) return '';
  // Se já estiver no formato HH:MM
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(val)) {
    return val;
  }
  const digits = val.replace(/\D/g, '');
  if (!digits) return val;

  if (digits.length === 1) {
    // 6 -> 06:00
    return `0${digits}:00`;
  }
  if (digits.length === 2) {
    const num = parseInt(digits, 10);
    if (num <= 23) {
      return `${digits.padStart(2, '0')}:00`;
    }
    // Ex: 65 -> 06:05
    return `0${digits[0]}:0${digits[1]}`;
  }
  if (digits.length === 3) {
    // 630 -> 06:30, 745 -> 07:45
    const hour = digits.slice(0, 1).padStart(2, '0');
    let min = parseInt(digits.slice(1, 3), 10);
    if (min > 59) min = 59;
    return `${hour}:${min.toString().padStart(2, '0')}`;
  }
  if (digits.length >= 4) {
    // 2230 -> 22:30, 0630 -> 06:30
    let hour = parseInt(digits.slice(0, 2), 10);
    if (hour > 23) hour = 23;
    let min = parseInt(digits.slice(2, 4), 10);
    if (min > 59) min = 59;
    return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
  }
  return val;
}

export function calculateAge(birthDateStr?: string | null): number | null {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export interface IMCResult {
  imc: number;
  classificacao: string;
  badgeClass: string;
}

export function calculateIMC(pesoKg: number | null, alturaCm: number | null): IMCResult | null {
  if (!pesoKg || !alturaCm || pesoKg <= 0 || alturaCm <= 0) return null;
  // Se altura for dada em cm (ex: 170), converte para metros (1.70)
  const alturaM = alturaCm > 3 ? alturaCm / 100 : alturaCm;
  const imc = parseFloat((pesoKg / (alturaM * alturaM)).toFixed(1));

  let classificacao = '';
  let badgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';

  if (imc < 18.5) {
    classificacao = 'Abaixo do peso';
    badgeClass = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (imc < 25) {
    classificacao = 'Peso adequado (Eutrófico)';
    badgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (imc < 30) {
    classificacao = 'Sobrepeso';
    badgeClass = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (imc < 35) {
    classificacao = 'Obesidade Grau I';
    badgeClass = 'text-orange-700 bg-orange-50 border-orange-200';
  } else if (imc < 40) {
    classificacao = 'Obesidade Grau II';
    badgeClass = 'text-rose-700 bg-rose-50 border-rose-200';
  } else {
    classificacao = 'Obesidade Grau III';
    badgeClass = 'text-red-700 bg-red-50 border-red-200';
  }

  return { imc, classificacao, badgeClass };
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return new Date(dateStr).toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
}

