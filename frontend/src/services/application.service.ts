import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
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

const { ENDPOINTS } = API_CONFIG;

class ApplicationService {
  applyForJob(data: ApplyForJobRequest) {
    return apiService.call<ApplyForJobResponse>(
      ENDPOINTS.APPLY_FOR_A_JOB,
      'APPLY_FOR_A_JOB',
      data
    );
  }

  getUserApplications(data: GetUserApplicationsRequest) {
    return apiService.call<GetUserApplicationsResponse>(
      ENDPOINTS.GET_USER_APPLICATIONS,
      'GET_USER_APPLICATIONS',
      data
    );
  }

  getApplicationStatus(data: GetApplicationStatusRequest) {
    return apiService.call<GetApplicationStatusResponse>(
      ENDPOINTS.GET_APPLICATION_STATUS,
      'GET_APPLICATION_STATUS',
      data
    );
  }

  getApplicationsWithCompanyId(data: GetApplicationsWithCompanyIdRequest) {
    return apiService.call<GetApplicationsWithCompanyIdResponse>(
      ENDPOINTS.GET_APPLICATIONS_WITH_COMPANY_ID,
      'GET_APPLICATIONS_WITH_COMPANY_ID',
      data
    );
  }

  getApplicantsInformation(data: GetApplicantsInformationRequest) {
    return apiService.call<GetApplicantsInformationResponse>(
      ENDPOINTS.GET_APPLICANTS_INFORMATION,
      'GET_APPLICANTS_INFORMATION',
      data
    );
  }

  changeApplicationStatus(data: ChangeApplicationStatusRequest) {
    return apiService.call<ChangeApplicationStatusResponse>(
      ENDPOINTS.CHANGE_APPLICATION_STATUS,
      'CHANGE_APPLICATION_STATUS',
      data
    );
  }
}

export default new ApplicationService();