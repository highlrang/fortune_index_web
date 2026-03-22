const TAROT_DECK_KEY = 'stock-oracle-tarot-deck';
const TAROT_DECK_VERSIONS_KEY = 'stock-oracle-tarot-deck-versions';

export interface TarotDeckVersion {
  id: string;
  name: string;
  description: string;
  coverImageUrl?: string | null;
}

export const TAROT_DECK_VERSIONS: TarotDeckVersion[] = [
  {
    id: 'classic-rider-waite',
    name: '클래식 라이더',
    description: '기본 타로 덱',
  },
  {
    id: 'mystic-gold',
    name: '미스틱 골드',
    description: '프리미엄 덱 예정',
  },
  {
    id: 'lunar-veil',
    name: '루나 베일',
    description: '시네마틱 덱 예정',
  },
];

export const DEFAULT_TAROT_DECK_ID = TAROT_DECK_VERSIONS[0].id;

export function getCachedTarotDeckVersions() {
  const raw = localStorage.getItem(TAROT_DECK_VERSIONS_KEY);
  if (!raw) return TAROT_DECK_VERSIONS;

  try {
    const parsed = JSON.parse(raw) as TarotDeckVersion[];
    return parsed.length > 0 ? parsed : TAROT_DECK_VERSIONS;
  } catch {
    localStorage.removeItem(TAROT_DECK_VERSIONS_KEY);
    return TAROT_DECK_VERSIONS;
  }
}

export function saveTarotDeckVersions(decks: TarotDeckVersion[]) {
  localStorage.setItem(TAROT_DECK_VERSIONS_KEY, JSON.stringify(decks));
}

export function getSelectedTarotDeckId() {
  return localStorage.getItem(TAROT_DECK_KEY) ?? DEFAULT_TAROT_DECK_ID;
}

export function setSelectedTarotDeckId(deckId: string) {
  localStorage.setItem(TAROT_DECK_KEY, deckId);
}

export function getTarotDeckById(deckId: string) {
  const decks = getCachedTarotDeckVersions();
  return decks.find((deck) => deck.id === deckId) ?? decks[0] ?? TAROT_DECK_VERSIONS[0];
}
