export interface RepositoryResponse<T = any> {
  status: boolean;
  message: string;
  data?: T;
}
