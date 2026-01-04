import { API_CONFIG } from "../config/api.config";

export interface Location {
  location_id: number;
  name: string;
}

interface LocationsResponse {
  code: string;
  description: string;
  data: Location[];
}

class LocationsService {
  async getLocations(): Promise<Location[]> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_LOCATIONS}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: API_CONFIG.TOKEN,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener ubicaciones");
    }

    const result: LocationsResponse = await response.json();
    return result.data;
  }
}

export default new LocationsService();