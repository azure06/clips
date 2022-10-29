import { GaxiosError } from 'gaxios';

export interface Success<T> {
  status: 'success';
  data: T;
}

export interface Failure {
  status: 'failure';
  message: string;
}

export interface HttpSuccess<T> {
  status: number;
  data: T;
}

export interface HttpFailure {
  status?: number;
  message: string;
}

export type Result__<T> = Success<T> | Failure;
export type HttpResult__<T> = HttpSuccess<T> | HttpFailure;

export function isSuccess<T>(response: Result__<T>): response is Success<T> {
  return response.status === 'success';
}

export function isSuccessHttp<T>(
  response: HttpResult__<T>
): response is HttpSuccess<T> {
  return (
    response.status !== undefined &&
    response.status >= 200 &&
    response.status < 400
  );
}

export function runCatching(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  captureException: (e: any) => any
): // eslint-disable-next-line @typescript-eslint/no-explicit-any
<P extends any[], T>(
  func: (...args: P) => T,
  message?: string
) => (...args: P) => Promise<Result__<T extends Promise<infer U> ? U : T>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function runCatching<P extends any[], T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  captureException: (e: any) => any
): (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  func: (...args: P) => T,
  message?: string
) => (...args: P) => Promise<Result__<T>> {
  return (func, message) =>
    (...args) =>
      Promise.resolve(func) // Wrap inside a promise
        .then((func) => func(...args)) //  We execute the function inside a promise to capture the exception in case of fail
        .then((data) => ({
          status: 'success' as const,
          data,
        }))
        .catch((e) => {
          captureException(e);
          if (e instanceof Error) {
            return { status: 'failure' as const, message: e.message };
          } else if (typeof e === 'string') {
            return { status: 'failure' as const, message: e };
          } else {
            return {
              status: 'failure' as const,
              message: message ?? 'Something went wrong',
            };
          }
        });
}

export const runCatchingHttpError = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  captureException: (e: any) => any
): (<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends any[],
  T1 extends Promise<{ status: number; data: T2 }>,
  T2
>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  func: (...args: P) => T1,
  message?: string
) => (...args: P) => Promise<HttpResult__<T2>>) => {
  return (func, message) =>
    (...args) =>
      Promise.resolve(func) // Wrap inside a promise
        .then((func) => func(...args)) //  We execute the function inside a promise to capture the exception in case of fail
        .then((res) => ({
          status: res.status,
          data: res.data,
        }))
        .catch((e) => {
          captureException(e);
          if (e instanceof GaxiosError) {
            return {
              status: e.response?.status,
              message: e.response?.statusText ?? e.message,
            };
          } else if (e instanceof Error) {
            return { message: e.message };
          } else if (typeof e === 'string') {
            return { message: e };
          } else {
            return {
              message: message ?? 'Something went wrong',
            };
          }
        });
};
