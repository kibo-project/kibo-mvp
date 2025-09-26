// Additional shared types for the architecture

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface FormData {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
}
