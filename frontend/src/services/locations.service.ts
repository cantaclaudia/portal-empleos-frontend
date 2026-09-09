import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import errorHandler from './error-handler.service';
import type { GetLocationsResponse } from '../types/location.types';
import type { ErrorCode } from '../constants/error-codes';
import type { ApiResponse } from './error-handler.service';

class LocationsService {
  async getLocations(): Promise<GetLocationsResponse> {
    try {
      const response = await apiService.post<GetLocationsResponse>(
        API_CONFIG.ENDPOINTS.GET_LOCATIONS,
        {}
      );

      if (errorHandler.isSuccess(response.code as ErrorCode)) {
        return response;
      }

      throw errorHandler.handleApiError(response as ApiResponse, 'GET_LOCATIONS');
    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }
}

export default new LocationsService();
