export type DriveResponse<T> = Successful<T> | Unsuccessful<T>;

type Successful<T> = {
  status: number;
  statusText: string;
  data: T;
};
type Unsuccessful<T> = Omit<Successful<T>, 'data'>;

export function isDriveResponse<T>(
  driveResponse: any
): driveResponse is DriveResponse<T> {
  return (
    !!driveResponse &&
    typeof driveResponse === 'object' &&
    'status' in driveResponse
  );
}
