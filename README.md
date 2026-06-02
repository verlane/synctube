# SyncTube

두 개의 YouTube 영상을 위/아래(또는 좌우)로 띄워 싱크를 맞추고, 그 싱크를 담은 링크로 공유하는 웹앱.

```bash
git clone git@github.com:verlane/synctube.git
cd synctube
npm install
npm run dev
```

## 사용법

1. 위/아래 영상 링크 입력 → **영상 불러오기**
2. **오프셋** 버튼(±0.1 / ±1초)이나 직접 입력으로 두 영상 싱크를 맞춤
3. **소리** 토글로 어느 쪽에서 소리가 날지 선택 (항상 한쪽만)
4. **위아래 / 좌우** 배치 토글로 보기 방식 선택
5. **이 싱크로 URL 만들기** → 공유 링크 복사 (`처음부터 재생` 체크 시 정렬 유지한 채 처음부터)
6. 그 링크로 접속하면 **동시 재생** 버튼 → 맞춰둔 싱크대로 동시 재생

브라우저의 자동재생 정책 때문에 공유 링크 접속 시에는 버튼을 한 번 눌러야 소리와 함께 재생됩니다.

### 키보드 단축키 (편집 모드)

- `←` / `→` — 오프셋 ±0.1초
- `Shift` + `←` / `→` — ±1초
- `Space` — 동시 재생 / 정지

## 공유 URL 파라미터

`/?a={영상A_id}&b={영상B_id}&o={오프셋초}&s={A시작초}&m={a|b}&l={col|row}`

- `o` = 두 영상 간 오프셋 (`timeB - timeA`)
- `s` = 접속 시 A 영상의 시작 위치
- `m` = 음소거할 쪽 (`a` = 위 영상 무음 / `b` = 아래 영상 무음)
- `l` = 배치 (`col` = 위아래 / `row` = 좌우)

공유 링크는 두 영상 썸네일을 합친 OG 이미지(`/og`)를 자동 생성해 SNS 미리보기에 표시합니다.

## 개발

```bash
npm run dev      # 개발 서버
npm test         # 순수 로직 단위 테스트 (vitest)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
```

## 구조

| 경로 | 역할 |
|---|---|
| `lib/youtube.ts` | 다양한 형태의 URL → video id 추출/검증 |
| `lib/share-state.ts` | 오프셋/음소거/배치 상태 ↔ 쿼리스트링 인코딩 |
| `hooks/useSyncedPlayers.ts` | 오프셋 기반 동시 재생 + 드리프트 보정 |
| `hooks/useKeyboardShortcuts.ts` | 편집 모드 키보드 단축키 |
| `components/SyncApp.tsx` | 전체 화면 오케스트레이션 |
| `components/PlayerFrame.tsx` | 단일 YouTube 플레이어 |
| `components/OffsetControl.tsx` | 오프셋 표시 + ±버튼 + 직접 입력 |
| `components/UrlInputs.tsx` | 링크 입력 폼 |
| `components/Controls.tsx` | 재생/음소거/배치/공유 컨트롤 |
| `app/og/route.tsx` | 두 썸네일 합성 OG 이미지 |

## Vercel 배포

```bash
npx vercel        # 프리뷰 배포
npx vercel --prod # 프로덕션 배포
```

또는 GitHub 저장소를 [vercel.com/new](https://vercel.com/new)에 연결하면 자동 배포됩니다. 별도 환경변수나 서버 설정은 필요 없습니다.
