import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import errorHandler from './error-handler.service';
import type { GetCompaniesResponse, CreateCompanyRequest, CreateCompanyResponse } from '../types/employer.types';
import type { ErrorCode } from '../constants/error-codes';
import type { ApiResponse } from './error-handler.service';

class CompanyService {
  async getCompaniesList(userId: string): Promise<GetCompaniesResponse> {
    try {
      const response = await apiService.post<GetCompaniesResponse>(
        API_CONFIG.ENDPOINTS.GET_COMPANIES_LIST,
        {},
        {
          user_id: userId,
        }
      );

      if (errorHandler.isSuccess(response.code as ErrorCode)) {
        return response;
      }

      throw errorHandler.handleApiError( response as ApiResponse,'GET_COMPANIES');
    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }

  async createNewCompany(data: CreateCompanyRequest): Promise<CreateCompanyResponse> {
    try {
      const response = await apiService.post<CreateCompanyResponse>(
        API_CONFIG.ENDPOINTS.CREATE_NEW_COMPANY,
        data
      );

      if (errorHandler.isSuccess(response.code as ErrorCode)) {
        return response;
      }

      throw errorHandler.handleApiError(response as ApiResponse, 'CREATE_NEW_COMPANY');
    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }
}

export default new CompanyService();
