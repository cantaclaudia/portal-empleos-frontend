import {
  ERROR_CODES,
  ENDPOINT_ERROR_MESSAGES,
  COMMON_ERROR_MESSAGES,
  type EndpointErrorMap,
} from '../constants/error-codes';

export interface ApiResponse {
  code: string;
  description?: string;
}

class ErrorHandlerService {
  handleApiError(response: ApiResponse, endpoint: EndpointErrorMap): never {
    const errorMessages =
      ENDPOINT_ERROR_MESSAGES[endpoint] as Partial<Record<string, string>>;

    const errorMessage =
      errorMessages[response.code] ||
      response.description ||
      COMMON_ERROR_MESSAGES.DEFAULT;

    throw new Error(errorMessage);
  }

  isSuccess(code: string): boolean {
    return code === ERROR_CODES.SUCCESS;
  }

}

export default new ErrorHandlerService();