# 로그인 정보 메일 발송 설정

## 1) 환경변수 설정
- `SMTP_HOST`
- `SMTP_PORT` (기본 `587`)
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- `SMTP_USE_TLS` (`true/false`)

`/Users/thebestguy/Documents/SalesMangemetService/.env.example`에 샘플 키가 추가되어 있습니다.

## 2) 메일 템플릿
- 제목: `[Cherrysales] 로그인 정보 안내`
- 본문 포함값:
  - 사용자 이름
  - 로그인 이메일(ID)
  - 임시 비밀번호
  - 로그인 후 비밀번호 변경 안내

## 3) 실제 발송 API
- Endpoint: `POST /api/v1/admin/notify-login-credential`
- Body:
```json
{
  "to_email": "user@example.com",
  "user_name": "홍길동",
  "temporary_password": "Temp#1234"
}
```

## 4) 프론트 연동
- 로그인 사용자 관리에서 저장 시 비밀번호가 입력되면 위 API를 호출합니다.
- 성공 시: 발송 완료 메시지 표시
- 실패 시: 저장은 유지되고 발송 실패 메시지 표시
