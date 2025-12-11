import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import type { RegisterEmployerRequest, RegisterEmployerResponse } from '../types/employer.types';

class EmployerService {
  async registerEmployer(data: RegisterEmployerRequest): Promise<RegisterEmployerResponse> {
    try {
      if (data.name.length > 20) {
        throw new Error('El nombre no puede exceder 20 caracteres');
      }
      if (data.last_name.length > 20) {
        throw new Error('El apellido no puede exceder 20 caracteres');
      }
      if (data.email.length > 60) {
        throw new Error('El correo electrónico no puede exceder 60 caracteres');
      }
      if (data.password.length > 30) {
        throw new Error('La contraseña no puede exceder 30 caracteres');
      }

      const response = await apiService.post<RegisterEmployerResponse>(
        API_CONFIG.ENDPOINTS.REGISTER_EMPLOYER,
        data
      );

      if (response.code === '0200') {
        return response;
      }

      switch (response.code) {
        case '0400':
          throw new Error('Solicitud incorrecta. Verifica los datos ingresados');
        case '0404':
          throw new Error('Empresa no encontrada');
        case '0410':
          throw new Error('El usuario ya está registrado');
        case '0500':
          throw new Error('Error interno del servidor. Intenta nuevamente más tarde');
        default:
          throw new Error(response.description || 'Error al registrar usuario');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión. Verifica tu conexión a internet');
    }
  }
}

export default new EmployerService();
