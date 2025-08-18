// src/services/orders/mock-data.ts

import { Order, User, TimelineEvent, OrderStatus, Quote } from '../../core/types/orders.types';

// ==========================================
// USUARIOS MOCK
// ==========================================

export const mockUsers: User[] = [
  {
    id: 'user_550e8400-e29b-41d4-a716-446655440000',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4014DfF0c1e1c87',
    role: 'user',
    country: 'BO',
    verified: true,
    successfulOrders: 12,
    reputation: 98,
    lastActive: '2025-08-08T14:30:00Z',
    createdAt: '2025-07-15T08:15:00Z',
  },
  {
    id: 'user_660f9511-f3ac-52e5-b827-557766551111',
    walletAddress: '0x8A2d35Cc6634C0532925a3b8D4014DfF0c1e1c98',
    role: 'user',
    country: 'BO',
    verified: false,
    successfulOrders: 3,
    reputation: 92,
    lastActive: '2025-08-08T12:15:00Z',
    createdAt: '2025-08-01T10:30:00Z',
  },
  {
    id: 'ally_770g0622-g4bd-63f6-c938-668877662222',
    walletAddress: '0x9B3e46Dd7634C0532925a3b8D4014DfF0c1e1d09',
    role: 'ally',
    country: 'BO',
    verified: true,
    successfulOrders: 45,
    reputation: 96,
    createdAt: '2025-06-10T10:30:00Z',
  },
  {
    id: 'ally_880h1733-h5ce-74g7-d049-779988773333',
    walletAddress: '0xAC4f57Ee8634C0532925a3b8D4014DfF0c1e1e10',
    role: 'ally',
    country: 'BO',
    verified: true,
    successfulOrders: 23,
    reputation: 94,
    createdAt: '2025-07-01T09:15:00Z',
  },
  {
    id: 'admin_990i2844-i6df-85h8-e150-880099884444',
    walletAddress: '0xBD5g68Ff9634C0532925a3b8D4014DfF0c1e1f21',
    role: 'admin',
    country: 'BO',
    verified: true,
    successfulOrders: 0,
    reputation: 100,
    createdAt: '2025-05-15T08:00:00Z',
  }
];

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

// Función para generar timeline basado en status
export const generateTimeline = (status: OrderStatus, createdAt: string): TimelineEvent[] => {
  const timeline: TimelineEvent[] = [
    { status: OrderStatus.PENDING_PAYMENT, timestamp: createdAt }
  ];

  const baseTime = new Date(createdAt).getTime();

  if (['AVAILABLE', 'TAKEN', 'COMPLETED', 'CANCELLED'].includes(status)) {
    timeline.push({
      status: OrderStatus.AVAILABLE,
      timestamp: new Date(baseTime + 1 * 60 * 1000).toISOString() // +1 min
    });
  }

  if (['TAKEN', 'COMPLETED'].includes(status)) {
    timeline.push({
      status: OrderStatus.TAKEN,
      timestamp: new Date(baseTime + 2 * 60 * 1000).toISOString() // +2 min
    });
  }

  if (status === 'COMPLETED') {
    timeline.push({
      status: OrderStatus.COMPLETED,
      timestamp: new Date(baseTime + 5 * 60 * 1000).toISOString() // +5 min
    });
  }

  if (status === 'CANCELLED') {
    timeline.push({
      status: OrderStatus.CANCELLED,
      timestamp: new Date(baseTime + 30 * 1000).toISOString() // +30 sec
    });
  }

  if (status === 'REFUNDED') {
    timeline.push({
      status: OrderStatus.REFUNDED,
      timestamp: new Date(baseTime + 10 * 60 * 1000).toISOString() // +10 min
    });
  }

  return timeline;
};

// Función para calcular secondsRemaining
export const calculateSecondsRemaining = (expiresAt: string): number => {
  const now = new Date().getTime();
  const expires = new Date(expiresAt).getTime();
  const diff = Math.max(0, expires - now);
  return Math.floor(diff / 1000);
};

// Función para generar IDs únicos
export const generateMockId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Función para simular delay de red
export const mockDelay = (ms: number = 800) =>
  new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// ÓRDENES MOCK CON DIFERENTES ESTADOS
// ==========================================

export const mockOrders: Order[] = [
  // ORDEN COMPLETADA
  {
    id: 'order_770f8611-f49d-52f6-a8b7-998877665544',
    status: OrderStatus.COMPLETED,
   fiatAmount: 300.00,
    cryptoAmount: 43.06,
    fiatCurrency: 'BOB',
    cryptoCurrency: 'USDT',
    network: 'mantle',
    escrowAddress: '0x1234567890abcdef1234567890abcdef12345678',
    qrData: 'BANCO_UNION|123456789|REF_KBO025',
    qrImage: 'https://via.placeholder.com/300x300/0066cc/ffffff?text=QR+Code+UNION',
    confirmationProof: 'https://via.placeholder.com/400x600/00cc66/ffffff?text=Payment+Proof+300BOB',
    createdAt: '2025-08-08T10:30:00Z',
    takenAt: '2025-08-08T10:32:00Z',
    completedAt: '2025-08-08T10:35:00Z',
    expiresAt: '2025-08-08T10:40:00Z',
    escrowTxHash: '0xabc123def456ghi789jkl012mno345pqr678stu901vwx234yz567',
    txHash: '0xdef456ghi789jkl012mno345pqr678stu901vwx234yz567abc123',
    bankTransactionId: 'TXN123456789',
    user: mockUsers[0],
    ally: mockUsers[2], // ally_770g0622
    timeline: generateTimeline(OrderStatus.COMPLETED, '2025-08-08T10:30:00Z'),
    bankingDetails: {
      bank: 'Banco Unión',
      accountNumber: '1234567890',
      beneficiary: 'Carlos Rivera Morales',
      reference: 'KBO025',
      exactAmount: '300.00 BOB'
    }
  },

  // ORDEN TOMADA (EN PROGRESO)
  {
    id: 'order_880g9722-g50e-63g7-b9c8-109988776655',
    status: OrderStatus.TAKEN,
    fiatAmount: 150.00,
    cryptoAmount: 21.53,
    fiatCurrency: 'BOB',
    cryptoCurrency: 'USDT',
    network: 'mantle',
    escrowAddress: '0x2345678901bcdef12345678901cdef2345678901',
    qrData: 'BANCO_BISA|987654321|REF_KBO026',
    qrImage: 'https://via.placeholder.com/300x300/cc6600/ffffff?text=QR+Code+BISA',
    createdAt: '2025-08-08T15:15:00Z',
    takenAt: '2025-08-08T15:17:00Z',
    expiresAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(), // 3 min desde ahora
    secondsRemaining: 180,
    escrowTxHash: '0xbcd234efa567hij890klm123nop456qrs789tuv012wxy345zab678',
    user: mockUsers[0],
    ally: mockUsers[3], // ally_880h1733
    timeline: generateTimeline(OrderStatus.TAKEN, '2025-08-08T15:15:00Z'),
    bankingDetails: {
      bank: 'Banco BISA',
      accountNumber: '9876543210',
      beneficiary: 'Ana Patricia Mamani',
      reference: 'KBO026',
      exactAmount: '150.00 BOB'
    }
  },

  // ORDEN DISPONIBLE PARA ALLIES
  {
    id: 'order_990h0833-h61f-74h8-c0d9-210099887766',
    status: OrderStatus.AVAILABLE,
    fiatAmount: 500.00,
    cryptoAmount: 71.77,
    fiatCurrency: 'BOB',
    cryptoCurrency: 'USDT',
    network: 'mantle',
    escrowAddress: '0x3456789012cdef123456789012def3456789012',
    createdAt: '2025-08-08T15:45:00Z',
    expiresAt: new Date(Date.now() + 8 * 60 * 1000).toISOString(), // 8 min desde ahora
    secondsRemaining: 480,
    escrowTxHash: '0xcde345fgb678ijk901lmn234opq567rst890uvw123xyz456abc789',
    user: mockUsers[1], // user diferente
    timeline: generateTimeline(OrderStatus.AVAILABLE, '2025-08-08T15:45:00Z'),
    userCountry: 'BO',
    estimatedGain: 71.77,
    bankingInfo: {
      bank: 'Banco Mercantil Santa Cruz',
      reference: 'KBO027'
    }
  },

  // ORDEN PENDIENTE DE PAGO
  {
    id: 'order_101i1944-i72g-85i9-d1e0-321100998877',
    status: OrderStatus.PENDING_PAYMENT,
    fiatAmount: 200.00,
    cryptoAmount: 28.71,
    fiatCurrency: 'BOB',
    cryptoCurrency: 'USDT',
    network: 'mantle',
    escrowAddress: '0x456789013def123456789013ef456789013def',
    qrImage: 'https://via.placeholder.com/300x300/cc0066/ffffff?text=QR+Pending+200BOB',
    createdAt: '2025-08-08T16:00:00Z',
    expiresAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 min desde ahora
    secondsRemaining: 120,
    user: mockUsers[0],
    timeline: generateTimeline(OrderStatus.PENDING_PAYMENT, '2025-08-08T16:00:00Z')
  },

  // ORDEN CANCELADA
  {
    id: 'order_112j2055-j83h-96j0-e2f1-432211009988',
    status: OrderStatus.CANCELLED,
    fiatAmount: 100.00,
    cryptoAmount: 14.35,
    fiatCurrency: 'BOB',
    cryptoCurrency: 'USDT',
    network: 'mantle',
    escrowAddress: '0x56789014def123456789014ef56789014def1',
    qrImage: 'https://via.placeholder.com/300x300/cc3333/ffffff?text=QR+Cancelled',
    createdAt: '2025-08-08T09:30:00Z',
    cancelledAt: '2025-08-08T09:30:30Z',
    expiresAt: '2025-08-08T09:33:00Z',
    user: mockUsers[0],
    timeline: generateTimeline(OrderStatus.CANCELLED, '2025-08-08T09:30:00Z')
  },

  // ORDEN REFUNDED (por timeout)
  {
    id: 'order_223k3166-k94i-07k1-f262-543322110099',
    status: OrderStatus.REFUNDED,
    fiatAmount: 250.00,
    cryptoAmount: 35.89,
    fiatCurrency: 'BOB',
    cryptoCurrency: 'USDT',
    network: 'mantle',
    escrowAddress: '0x67890125def123456789015ef67890125def2',
    qrData: 'BANCO_NACIONAL|555666777|REF_KBO028',
    qrImage: 'https://via.placeholder.com/300x300/999999/ffffff?text=QR+Refunded',
    createdAt: '2025-08-08T08:00:00Z',
    takenAt: '2025-08-08T08:02:00Z',
    expiresAt: '2025-08-08T08:07:00Z',
    escrowTxHash: '0xdef456ghi789jkl012mno345pqr678stu901vwx234yz567abc123def',
    txHash: '0xghi789jkl012mno345pqr678stu901vwx234yz567abc123def456ghi',
    user: mockUsers[1],
    ally: mockUsers[2],
    timeline: generateTimeline(OrderStatus.REFUNDED, '2025-08-08T08:00:00Z'),
    bankingDetails: {
      bank: 'Banco Nacional de Bolivia',
      accountNumber: '5556667777',
      beneficiary: 'Luis Fernando Condori',
      reference: 'KBO028',
      exactAmount: '250.00 BOB'
    }
  },

  // MÁS ÓRDENES DISPONIBLES (para testing)
  {
    id: 'order_334l4277-l05j-18l2-g373-654433221100',
    status: OrderStatus.AVAILABLE,
    fiatAmount: 75.00,
    cryptoAmount: 10.77,
    fiatCurrency: 'BOB',
    cryptoCurrency: 'USDT',
    network: 'mantle',
    escrowAddress: '0x78901236def123456789016ef78901236def3',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // Creada hace 2 min
    expiresAt: new Date(Date.now() + 13 * 60 * 1000).toISOString(), // Expira en 13 min
    secondsRemaining: 780,
    escrowTxHash: '0xfgh890jkl123mno456pqr789stu012vwx345yz678abc901def234ghi',
    user: mockUsers[1],
    timeline: generateTimeline(OrderStatus.AVAILABLE, new Date(Date.now() - 2 * 60 * 1000).toISOString()),
    userCountry: 'BO',
    estimatedGain: 10.77,
    bankingInfo: {
      bank: 'Banco Económico',
      reference: 'KBO029'
    }
  },

  {
    id: 'order_445m5388-m16k-29m3-h484-765544332211',
    status: OrderStatus.AVAILABLE,
    fiatAmount: 800.00,
    cryptoAmount: 114.84,
    fiatCurrency: 'BOB',
    cryptoCurrency: 'USDT',
    network: 'mantle',
    escrowAddress: '0x89012347def123456789017ef89012347def4',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // Creada hace 5 min
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // Expira en 10 min
    secondsRemaining: 600,
    escrowTxHash: '0xghi901jkl234mno567pqr890stu123vwx456yz789abc012def345ghi',
    user: mockUsers[0],
    timeline: generateTimeline(OrderStatus.AVAILABLE, new Date(Date.now() - 5 * 60 * 1000).toISOString()),
    userCountry: 'BO',
    estimatedGain: 114.84,
    bankingInfo: {
      bank: 'Banco Sol',
      reference: 'KBO030'
    }
  },

  // ÓRDENES COMPLETADAS ADICIONALES (para historial)
  {
    id: 'order_556n6499-n27l-30n4-i595-876655443322',
    status: OrderStatus.COMPLETED,
    fiatAmount: 180.00,
    cryptoAmount: 25.83,
    fiatCurrency: 'BOB',
    cryptoCurrency: 'USDT',
    network: 'mantle',
    escrowAddress: '0x90123458def123456789018ef90123458def5',
    qrData: 'BANCO_FIE|444333222|REF_KBO031',
    qrImage: 'https://via.placeholder.com/300x300/0066cc/ffffff?text=QR+FIE+180',
    confirmationProof: 'https://via.placeholder.com/400x600/00cc66/ffffff?text=Proof+180BOB',
    createdAt: '2025-08-07T14:20:00Z',
    takenAt: '2025-08-07T14:22:00Z',
    completedAt: '2025-08-07T14:28:00Z',
    expiresAt: '2025-08-07T14:27:00Z',
    escrowTxHash: '0xhij012jkl345mno678pqr901stu234vwx567yz890abc123def456ghi',
    txHash: '0xjkl345mno678pqr901stu234vwx567yz890abc123def456ghi789jkl',
    bankTransactionId: 'TXN987654321',
    user: mockUsers[1],
    ally: mockUsers[2],
    timeline: generateTimeline(OrderStatus.COMPLETED, '2025-08-07T14:20:00Z'),
    bankingDetails: {
      bank: 'Banco FIE',
      accountNumber: '4443332222',
      beneficiary: 'Rosa Elena Quispe',
      reference: 'KBO031',
      exactAmount: '180.00 BOB'
    }
  }
];

// ==========================================
// QUOTES MOCK (para crear órdenes)
// ==========================================

export const mockQuotes: Quote[] = [
  {
    id: 'quote_550e8400-e29b-41d4-a716-446655440000',
    amountFiat: 300.00,
    amountCrypto: 43.06,
    rate: 6.97,
    networkFee: 0.10,
    kiboFee: 0.00,
    totalAmount: 43.16,
    expiresAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(), // 3 min desde ahora
    escrowAddress: '0x1234567890abcdef1234567890abcdef12345678',
    rateSource: 'binance_api/coingecko',
    rateTimestamp: new Date().toISOString(),
    cryptoToken: 'USDT',
    fiatCurrency: 'BOB',
    network: 'mantle',
  },
  {
    id: 'quote_661f9511-f3ac-52e5-b827-557766551111',
    amountFiat: 150.00,
    amountCrypto: 21.53,
    rate: 6.97,
    networkFee: 0.08,
    kiboFee: 0.00,
    totalAmount: 21.61,
    expiresAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 min desde ahora
    escrowAddress: '0x2345678901bcdef12345678901cdef2345678901',
    rateSource: 'binance_api/coingecko',
    rateTimestamp: new Date().toISOString(),
    cryptoToken: 'USDT',
    fiatCurrency: 'BOB',
    network: 'mantle',
  },
  {
    id: 'quote_772g0622-g4bd-63f6-c938-668877662222',
    amountFiat: 500.00,
    amountCrypto: 71.77,
    rate: 6.97,
    networkFee: 0.15,
    kiboFee: 0.00,
    totalAmount: 71.92,
    expiresAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(), // 3 min desde ahora
    escrowAddress: '0x3456789012cdef123456789012def3456789012',
    rateSource: 'binance_api/coingecko',
    rateTimestamp: new Date().toISOString(),
    cryptoToken: 'USDT',
    fiatCurrency: 'BOB',
    network: 'mantle',
  }
];

// ==========================================
// DATOS ADICIONALES PARA MOCKS
// ==========================================

// Bancos bolivianos más comunes
export const mockBanks = [
  'Banco Unión',
  'Banco BISA',
  'Banco Mercantil Santa Cruz',
  'Banco Nacional de Bolivia',
  'Banco Económico',
  'Banco Sol',
  'Banco FIE',
  'Banco Ganadero',
  'Banco de Crédito',
  'Banco Fassil'
];

// Referencias mock para órdenes
export const generateMockReference = (): string => {
  const prefix = 'KBO';
  const number = Math.floor(Math.random() * 999) + 1;
  return `${prefix}${number.toString().padStart(3, '0')}`;
};

// Función para generar datos bancarios mock
export const generateMockBankingDetails = () => {
  const bank = mockBanks[Math.floor(Math.random() * mockBanks.length)];
  const accountNumber = Math.floor(Math.random() * 9000000000) + 1000000000; // 10 dígitos
  const names = ['Carlos', 'Ana', 'Luis', 'María', 'José', 'Rosa', 'Miguel', 'Elena'];
  const lastNames = ['Rivera', 'Mamani', 'Condori', 'Quispe', 'Morales', 'Vargas', 'Choque', 'Flores'];

  const firstName = names[Math.floor(Math.random() * names.length)];
  const lastName1 = lastNames[Math.floor(Math.random() * lastNames.length)];
  const lastName2 = lastNames[Math.floor(Math.random() * lastNames.length)];

  return {
    bank,
    accountNumber: accountNumber.toString(),
    beneficiary: `${firstName} ${lastName1} ${lastName2}`,
    reference: generateMockReference()
  };
};

// Función para filtrar órdenes por rol
export const getOrdersByRole = (role: 'user' | 'ally' | 'admin', userId: string): Order[] => {
  switch (role) {
    case 'user':
      return mockOrders.filter(order => order.user?.id === userId);

    case 'ally':
      return mockOrders.filter(order =>
        order.user?.id === userId || order.ally?.id === userId
      );

    case 'admin':
      return mockOrders; // Admin ve todas las órdenes

    default:
      return [];
  }
};

// Función para simular actualización de secondsRemaining en tiempo real
export const updateOrdersRealtime = (orders: Order[]): Order[] => {
  return orders.map(order => {
    if (['PENDING_PAYMENT', 'AVAILABLE', 'TAKEN'].includes(order.status)) {
      const secondsRemaining = calculateSecondsRemaining(order.expiresAt);
      return {
        ...order,
        secondsRemaining: Math.max(0, secondsRemaining)
      };
    }
    return order;
  });
};
