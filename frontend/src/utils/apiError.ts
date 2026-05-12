import axios from 'axios';

type ApiErrorResponse = {
  error?: string;
  details?: Array<{ field?: string; message?: string }>;
};

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  const details = error.response?.data?.details;
  if (Array.isArray(details) && details.length > 0) {
    return details
      .map((detail) => detail.message)
      .filter((message): message is string => Boolean(message))
      .join(' ');
  }

  return error.response?.data?.error ?? fallback;
}
