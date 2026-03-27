# Thread Context Summary

## Current Behavior

- 상담 화면에서는 스레드 선택 UI를 노출하지 않습니다.
- 내부적으로는 `ConsultationPage`가 `location.state.resumeThreadId`를 받으면 그대로 유지합니다.
- `resumeThreadStatus`가 `EXPIRED` 또는 `CLOSED`가 아니면 제출 시 `consult(..., threadId)`에 전달됩니다.
- 사용자가 화면에서 별도 선택을 하지 않아도, 이전 화면에서 이어진 맥락이 있으면 백엔드 요청에는 포함될 수 있습니다.

## Why It Is Hidden

- 스레드 개념이 초기 진입 UI를 무겁게 만들었습니다.
- 기본 상담 플로우에서는 새로 시작하는 느낌이 더 자연스럽습니다.
- 맥락 이어보기는 이후에 체크박스나 단일 토글 같은 더 명료한 UI로 다시 붙이는 편이 적합합니다.

## Suggested Next UI

- 기본값은 항상 새 상담처럼 보이게 유지합니다.
- 필요할 때만 `이전 맥락 이어서 보기` 체크박스 1개를 노출합니다.
- 체크 시에만 최근 상담 요약 또는 마지막 질문을 보조 정보로 보여줍니다.
