import { useQuery } from '@tanstack/react-query';
import { quoteService } from '../../services/quote';
import {GetQuoteDto} from '../../core/dto/quote.dto';

// Hook para obtener cotización en tiempo real
export const useQuote = (params: GetQuoteDto, options: { enabled?: boolean } = {}) => {
    return useQuery({
        queryKey: ['quote', params.fiatAmount, params.fiatCurrency, params.cryptoCurrency, params.network],
        queryFn: () => quoteService.getQuote(params),
        enabled: options.enabled !== false && params.fiatAmount > 10, // Solo ejecutar si hay un monto válido
        staleTime: 30000, // Los datos se consideran frescos por 30 segundos
        gcTime: 60000, // Cache por 1 minuto (antes era cacheTime)
        refetchInterval: 60000, // Refetch automático cada 60 segundos
        refetchIntervalInBackground: false, // No refetch en background
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        onSuccess: (data) => {
            console.log('Quote obtained successfully:', data);
        },
        onError: (error) => {
            console.error('Error getting quote:', error);
        },
    });
};
