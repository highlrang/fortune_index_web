interface Window {
  __FORTUNE_NATIVE_TAROT_COMPLETE__?: (payload: {
    selectedCards: number[];
    deckOrder: number[];
    tarotDeckVersionId: string;
    [key: string]: unknown;
  }) => void;
}
