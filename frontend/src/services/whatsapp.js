export function normalizeWhatsAppNumber(phone) {
  let digits = String(phone || '').replace(/\D/g, '');

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = `92${digits.slice(1)}`;
  } else if (digits.length === 10 && digits.startsWith('3')) {
    digits = `92${digits}`;
  }

  return digits.length >= 8 && digits.length <= 15 ? digits : '';
}

export function getWhatsAppUrl(phone, message) {
  const number = normalizeWhatsAppNumber(phone);
  if (!number) return '';

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
