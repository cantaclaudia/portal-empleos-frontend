import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import type {
  GetJobTypeListResponse,
  CreateJobOfferRequest,
  CreateJobOfferResponse,
  CreateNewJobRequest,
  CreateNewJobResponse,
} from '../types/job.types';

const { ENDPOINTS } = API_CONFIG;

class JobService {
  getJobTypeList() {
    return apiService.call<GetJobTypeListResponse>(
      ENDPOINTS.GET_JOB_TYPE_LIST,
      'GET_JOB_TYPE_LIST'
    );
  }

  createJobOffer(data: CreateJobOfferRequest) {
    return apiService.call<CreateJobOfferResponse>(
      ENDPOINTS.CREATE_JOB_OFFER,
      'CREATE_JOB_OFFER',
      data
    );
  }

  createNewJob(data: CreateNewJobRequest) {
    return apiService.call<CreateNewJobResponse>(
      ENDPOINTS.CREATE_NEW_JOB,
      'CREATE_NEW_JOB',
      data
    );
  }
}

export default new JobService();