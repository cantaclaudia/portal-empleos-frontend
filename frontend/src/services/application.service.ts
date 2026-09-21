import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import errorHandler from './error-handler.service';
import type { ErrorCode } from '../constants/error-codes';
import type { ApiResponse } from './error-handler.service';
import type {
  GetUserApplicationsRequest,
  GetUserApplicationsResponse,
  GetApplicationStatusRequest,
  GetApplicationStatusResponse,
  GetApplicationsWithCompanyIdRequest,
  GetApplicationsWithCompanyIdResponse,
  ApplyForJobRequest,
  ApplyForJobResponse,
  ChangeApplicationStatusRequest,
  ChangeApplicationStatusResponse,
  GetApplicantsInformationRequest,
  GetApplicantsInformationResponse,
} from '../types/application.types';

class ApplicationService {
  async applyForJob(
    data: ApplyForJobRequest,
    userId: string
  ): Promise<ApplyForJobResponse> {
    try {
      const response = await apiService.post<ApplyForJobResponse>(
        API_CONFIG.ENDPOINTS.APPLY_FOR_A_JOB,
        data,
        {
          user_id: userId,
        }
      );

      if (errorHandler.isSuccess(response.code as ErrorCode)) {
        return response;
      }

      throw errorHandler.handleApiError(
        response as ApiResponse,
        'APPLY_FOR_A_JOB'
      );
    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }

  async getUserApplications(data: GetUserApplicationsRequest): Promise<GetUserApplicationsResponse> {
    try {
      const response = await apiService.post<GetUserApplicationsResponse>(
        API_CONFIG.ENDPOINTS.GET_USER_APPLICATIONS,
        data,
        {
          user_id: data.candidate_id,
        }
      );

      if (errorHandler.isSuccess(response.code as ErrorCode)) {
        return response;
      }

      throw errorHandler.handleApiError(response as ApiResponse, 'GET_USER_APPLICATIONS');
    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }

  async getApplicationStatus(data: GetApplicationStatusRequest, userId: string): Promise<GetApplicationStatusResponse> {
    try {
      const response = await apiService.post<GetApplicationStatusResponse>(
        API_CONFIG.ENDPOINTS.GET_APPLICATION_STATUS,
        data,
        {
          user_id: userId,
        }
      );

      if (errorHandler.isSuccess(response.code as ErrorCode)) {
        return response;
      }

      throw errorHandler.handleApiError(response as ApiResponse, 'GET_APPLICATION_STATUS');
    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }

  async getApplicationsWithCompanyId(data: GetApplicationsWithCompanyIdRequest, userId: string): Promise<GetApplicationsWithCompanyIdResponse> {
    try {
      const response = await apiService.post<GetApplicationsWithCompanyIdResponse>(
        API_CONFIG.ENDPOINTS.GET_APPLICATIONS_WITH_COMPANY_ID,
        data,
        {
          user_id: userId,
        }
      );

      if (errorHandler.isSuccess(response.code as ErrorCode)) {
        return response;
      }

      throw errorHandler.handleApiError(response as ApiResponse, 'GET_APPLICATIONS_WITH_COMPANY_ID');
    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }

  async getApplicantsInformation(data: GetApplicantsInformationRequest, userId: string): Promise<GetApplicantsInformationResponse> {
    try {
      const response = await apiService.post<GetApplicantsInformationResponse>(
        API_CONFIG.ENDPOINTS.GET_APPLICANTS_INFORMATION,
        data,
        {
          user_id: userId,
        }
      );

      if (errorHandler.isSuccess(response.code as ErrorCode)) {
        return response;
      }

      throw errorHandler.handleApiError(response as ApiResponse, 'GET_APPLICANTS_INFORMATION');
    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }

  async changeApplicationStatus(data: ChangeApplicationStatusRequest): Promise<ChangeApplicationStatusResponse> {
    try {
      const response = await apiService.post<ChangeApplicationStatusResponse>(
        API_CONFIG.ENDPOINTS.CHANGE_APPLICATION_STATUS,
        data
      );

      if (errorHandler.isSuccess(response.code as ErrorCode)) {
        return response;
      }

      throw errorHandler.handleApiError(response as ApiResponse, 'CHANGE_APPLICATION_STATUS');
    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }
}

export default new ApplicationService();
