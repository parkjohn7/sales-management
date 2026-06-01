from email.message import EmailMessage
import smtplib

from app.core.config import get_settings


def send_login_credentials_email(*, to_email: str, user_name: str, temporary_password: str) -> tuple[bool, str]:
    settings = get_settings()
    if not settings.smtp_host or not settings.smtp_from_email:
        return False, "SMTP 설정이 없습니다. smtp_host/smtp_from_email을 확인해주세요."

    subject = "[Cherrysales] 로그인 정보 안내"
    body = (
        f"{user_name}님,\n\n"
        "Cherrysales 로그인 정보가 발급되었습니다.\n"
        f"- 로그인 ID(이메일): {to_email}\n"
        f"- 임시 비밀번호: {temporary_password}\n\n"
        "보안을 위해 로그인 직후 비밀번호를 변경해주세요.\n"
        "감사합니다.\n"
    )
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.smtp_from_email
    message["To"] = to_email
    message.set_content(body)

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
            if settings.smtp_use_tls:
                smtp.starttls()
            if settings.smtp_username and settings.smtp_password:
                smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(message)
        return True, "메일 발송 성공"
    except Exception as exc:  # pragma: no cover
        return False, f"메일 발송 실패: {exc}"
