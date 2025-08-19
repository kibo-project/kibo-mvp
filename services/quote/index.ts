// Punto de entrada - decide qué servicio usar
// import { API_CONFIG } from '../../config/api';
import { quoteApiService } from './quote.api';

// Exporta el servicio según configuración
export const quoteService = quoteApiService; // Cambia por quoteMockService para testing
// TODO: Uncomment the next line to use the real API service
//  API_CONFIG.useMockServices
//   ? quoteMockService
//   : quoteApiService;

// Exportar tipos para uso en componentes
export * from '../../core/dto/quote.dto';