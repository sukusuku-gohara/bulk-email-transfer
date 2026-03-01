"""Chatwork API クライアント — メッセージ送信."""

import logging

import requests

logger = logging.getLogger(__name__)

CHATWORK_API_BASE = "https://api.chatwork.com/v2"


class ChatworkError(Exception):
    """Chatwork API 送信失敗."""


def send_message(api_token: str, room_id: str, body: str) -> dict:
    """Chatwork の指定ルームにメッセージを送信する.

    Returns:
        レスポンス JSON（message_id を含む）

    Raises:
        ChatworkError: HTTP エラー時
    """
    url = f"{CHATWORK_API_BASE}/rooms/{room_id}/messages"
    headers = {"X-ChatWorkToken": api_token}
    data = {"body": body, "self_unread": "0"}

    logger.info("Chatwork 送信開始: room_id=%s body_len=%d", room_id, len(body))

    resp = requests.post(url, headers=headers, data=data, timeout=30)

    if resp.status_code != 200:
        msg = f"Chatwork 送信失敗: HTTP {resp.status_code} {resp.text}"
        logger.error(msg)
        raise ChatworkError(msg)

    result = resp.json()
    logger.info("Chatwork 送信成功: message_id=%s", result.get("message_id"))
    return result
