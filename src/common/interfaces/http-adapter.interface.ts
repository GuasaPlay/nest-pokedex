import { AxiosRequestConfig } from 'axios';

export interface HttpAdapter {
  get<T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>;
}
