// Punto de entrada - decide qué servicio usar
// import { API_CONFIG } from '../../config/api';
import { ordersMockService } from './orders.mock';
import { ordersApiService } from './orders.api';
//AQUI SE HACE EL FETCH
// Exporta el servicio según configuración
export const ordersService = ordersApiService;
// TODO: Uncomment the next line to use the real API service
//  API_CONFIG.useMockServices 
//   ? ordersMockService 
//   : ordersApiService;

// Exportar tipos para uso en componentes
export * from '../../core/types/orders.types';