import { GaxiosResponse, GaxiosError } from 'gaxios';

export function isGaxiosResponse(arg: GaxiosResponse | GaxiosError): arg is GaxiosResponse {
  return 'status' in arg;
}
