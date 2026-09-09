export interface Location {
  location_id: number;
  name: string;
}

export interface GetLocationsResponse {
  code: string;
  description: string;
  data: Location[];
}
