export function formatBirthDate(value?: string | null) {
  if (!value) return '미등록';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatBirthTime(
  value?: { hour: number; minute: number; second?: number } | string | null,
) {
  if (!value) return '미등록';

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '미등록';

    const match = trimmed.match(/^(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : trimmed;
  }

  const hour = String(value.hour).padStart(2, '0');
  const minute = String(value.minute).padStart(2, '0');
  return `${hour}:${minute}`;
}

export function normalizeGenderInputValue(value?: string | null) {
  if (!value) return '';
  if (value === 'M' || value === 'MALE') return 'M';
  if (value === 'F' || value === 'FEMALE') return 'F';
  return '';
}

export function splitDateParts(value?: string | null) {
  if (!value) return { year: '', month: '', day: '' };

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-');
    return { year, month, day };
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return { year: '', month: '', day: '' };

  return {
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    day: String(date.getDate()).padStart(2, '0'),
  };
}

export function splitTimeParts(
  value?: { hour?: number; minute?: number; second?: number } | string | null,
) {
  if (!value) return { hour: '', minute: '' };

  if (typeof value !== 'string') {
    const hour =
      typeof value.hour === 'number' ? String(value.hour).padStart(2, '0') : '';
    const minute =
      typeof value.minute === 'number' ? String(value.minute).padStart(2, '0') : '';
    return { hour, minute };
  }

  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{2}):(\d{2})/);
  if (!match) return { hour: '', minute: '' };

  return { hour: match[1], minute: match[2] };
}

export function buildBirthDate(year: string, month: string, day: string) {
  if (year.length !== 4 || month.length === 0 || day.length === 0) return '';

  const normalizedMonth = month.padStart(2, '0');
  const normalizedDay = day.padStart(2, '0');
  const formatted = `${year}-${normalizedMonth}-${normalizedDay}`;
  const date = new Date(`${formatted}T00:00:00`);

  if (Number.isNaN(date.getTime())) return '';
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() + 1 !== Number(normalizedMonth) ||
    date.getDate() !== Number(normalizedDay)
  ) {
    return '';
  }

  return formatted;
}

export function buildBirthTime(hour: string, minute: string) {
  if (hour.length === 0 && minute.length === 0) return '';
  if (hour.length === 0 || minute.length === 0) return '';

  const hourNumber = Number(hour);
  const minuteNumber = Number(minute);

  if (
    Number.isNaN(hourNumber) ||
    Number.isNaN(minuteNumber) ||
    hourNumber < 0 ||
    hourNumber > 23 ||
    minuteNumber < 0 ||
    minuteNumber > 59
  ) {
    return '';
  }

  return `${String(hourNumber).padStart(2, '0')}:${String(minuteNumber).padStart(2, '0')}`;
}

export function formatGender(gender?: string | null) {
  if (!gender) return '미등록';
  if (gender === 'M' || gender === 'MALE') return '남성';
  if (gender === 'F' || gender === 'FEMALE') return '여성';
  if (gender === 'OTHER') return '기타';
  if (gender === 'UNKNOWN') return '미등록';
  return gender;
}

export function calculateAge(birthDate?: string | null) {
  if (!birthDate) return '-';

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return '-';

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 ? `${age}세` : '-';
}
