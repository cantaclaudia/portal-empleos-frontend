import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import errorHandler from './error-handler.service';
import type {
  GetJobTypeListResponse,
  CreateJobOfferRequest,
  CreateJobOfferResponse,
  CreateNewJobRequest,
  CreateNewJobResponse,
} from '../types/job.types';
import type { ErrorCode } from '../constants/error-codes';
import type { ApiResponse } from './error-handler.service';

class JobService {
  async getJobTypeList(userId: string): Promise<GetJobTypeListResponse> {
  try {
    const response = await apiService.post<GetJobTypeListResponse>(
      API_CONFIG.ENDPOINTS.GET_JOB_TYPE_LIST,
      {},
      {
        user_id: userId,
      }
    );

    if (errorHandler.isSuccess(response.code as ErrorCode)) {
      return response;
    }

    throw errorHandler.handleApiError(response as ApiResponse,'GET_JOB_TYPE_LIST');
  } catch (error) {
    throw errorHandler.wrapConnectionError(error);
  }
}

  async createJobOffer(data: CreateJobOfferRequest, userId: string): Promise<CreateJobOfferResponse> {
    try {
      const response = await apiService.post<CreateJobOfferResponse>(
        API_CONFIG.ENDPOINTS.CREATE_JOB_OFFER,
        data,
        {
          user_id: userId,
        }
      );

      if (errorHandler.isSuccess(response.code as ErrorCode)) {
        return response;
      }

      throw errorHandler.handleApiError(response as ApiResponse, 'CREATE_JOB_OFFER');
    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }

  async createNewJob(data: CreateNewJobRequest): Promise<CreateNewJobResponse> {
    try {
      const response = await apiService.post<CreateNewJobResponse>(
        API_CONFIG.ENDPOINTS.CREATE_NEW_JOB,
        data
      );

      if (errorHandler.isSuccess(response.code as ErrorCode)) {
        return response;
      }

      throw errorHandler.handleApiError(response as ApiResponse, 'CREATE_NEW_JOB');
    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }
}

export default new JobService();
