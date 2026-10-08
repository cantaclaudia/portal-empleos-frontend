import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import type {
  GetCompaniesResponse,
  CreateCompanyRequest,
  CreateCompanyResponse,
} from '../types/employer.types';

const { ENDPOINTS } = API_CONFIG;

class CompanyService {
  getCompaniesList() {
    return apiService.call<GetCompaniesResponse>(
      ENDPOINTS.GET_COMPANIES_LIST,
      'GET_COMPANIES'
    );
  }

  createNewCompany(data: CreateCompanyRequest) {
    return apiService.call<CreateCompanyResponse>(
      ENDPOINTS.CREATE_NEW_COMPANY,
      'CREATE_NEW_COMPANY',
      data
    );
  }
}

export default new CompanyService();