interface Window {
  __FORTUNE_NATIVE_GO_BACK__?: () => boolean;
  __FORTUNE_NATIVE_BACK__?: () => boolean;
  __FORTUNE_NATIVE_TAROT_COMPLETE__?: (payload: {
    selectedCards: number[];
    deckOrder: number[];
    tarotDeckVersionId: string;
    [key: string]: unknown;
  }) => void;
}
