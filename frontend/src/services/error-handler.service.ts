import {
  ERROR_CODES,
  ENDPOINT_ERROR_MESSAGES,
  COMMON_ERROR_MESSAGES,
  type EndpointErrorMap,
  type ErrorCode
} from '../constants/error-codes';

export interface ApiResponse {
  code: ErrorCode;
  description?: string;
}

class ErrorHandlerService {
  handleApiError(response: ApiResponse, endpoint: EndpointErrorMap): never {
    const errorMessages =
      ENDPOINT_ERROR_MESSAGES[endpoint] as Partial<Record<ErrorCode, string>>;

    const errorMessage =
      errorMessages[response.code]
      || response.description
      || COMMON_ERROR_MESSAGES.DEFAULT;

    throw new Error(errorMessage);
  }

  isSuccess(code: ErrorCode): boolean {
    return code === ERROR_CODES.SUCCESS;
  }

  wrapConnectionError(error: unknown): never {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(COMMON_ERROR_MESSAGES.CONNECTION_ERROR);
  }
}

export default new ErrorHandlerService();