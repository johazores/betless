import type { NextApiResponse } from 'next';

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: string;
};

export function sendSuccess<T>(res: NextApiResponse, data: T, status = 200) {
  return res.status(status).json({ ok: true, data } satisfies ApiSuccess<T>);
}

export function sendError(res: NextApiResponse, error: string, status = 400) {
  return res.status(status).json({ ok: false, error } satisfies ApiFailure);
}

export function getApiErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.';
}
