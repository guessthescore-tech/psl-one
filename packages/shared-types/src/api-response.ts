export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  correlationId: string;
}
