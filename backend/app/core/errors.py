from fastapi import status


class AppError(Exception):
    def __init__(self, code: str, message: str, status_code: int) -> None:
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class ValidationAppError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__("VALIDATION_ERROR", message, status.HTTP_400_BAD_REQUEST)


class NotFoundError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__("NOT_FOUND", message, status.HTTP_404_NOT_FOUND)


class AIResultInvalidError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__("AI_RESULT_INVALID", message, status.HTTP_502_BAD_GATEWAY)


class AICallFailedError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__("AI_CALL_FAILED", message, status.HTTP_502_BAD_GATEWAY)
