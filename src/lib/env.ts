/**
 * 공통 API 베이스 URL.
 * `.env` / `.env.local`의 `NEXT_PUBLIC_API_BASE_URL`을 사용합니다.
 * 빈 문자열·공백만 있으면 기본값으로 되돌립니다. (빈 값이면 `/api/...`가
 * Next 프론트로 가서 404가 납니다.)
 * 끝의 `/`는 제거해 `.../` + `/api/...` 이중 슬래시를 막습니다.
 */
const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const rawBase =
  configured && configured.length > 0
    ? configured
    : "http://localhost:3001";
export const API_BASE_URL = rawBase.replace(/\/+$/, "");
