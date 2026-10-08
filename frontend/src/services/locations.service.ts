import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import type { GetLocationsResponse } from '../types/location.types';

class LocationService {
  getLocations() {
    return apiService.call<GetLocationsResponse>(
      API_CONFIG.ENDPOINTS.GET_LOCATIONS,
      'GET_LOCATIONS'
    );
  }
}

export default new LocationService();