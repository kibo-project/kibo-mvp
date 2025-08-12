# Kibo

**Kibo** es una solución descentralizada que permite a usuarios de Latinoamérica pagar códigos QR locales usando criptomonedas, mientras usuarios verificados cubren instantáneamente el lado fiat de las transacciones. Construido sobre Mantle blockchain y autenticado con Privy, Kibo facilita micropagos cripto desde 1 USDT con utilidad real y adopción creciente.

## 🔗 Enlaces Rápidos

| Recurso | Link |
|---------|------|
| 🚀 **Video Demo** | [Ver en YouTube](https://www.youtube.com/watch?v=cRYuQf6sPX4) |
| 🌐 **App en Vivo** | [kibo-app.vercel.app](https://kibo-app.vercel.app/) |
| 🎨 **Prototipo UI** | [Figma Design](https://www.figma.com/proto/Wfx266KqFmr3lx25zp5f4C/Kibo?page-id=0%3A1&node-id=23-2&viewport=2842%2C841%2C0.64&t=yFMKWsbfSIa77Zjj-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=52%3A1457) |
| 📋 **Lista de Espera** | [Únete aquí](https://docs.google.com/spreadsheets/d/1dk7zSf_jUvgI-7QNyQgQfbuEz_8bXHEh7Yqko5CT_eA/edit?usp=sharing) |

## 🎯 Validación de Mercado

En los primeros días, nuestro video en TikTok logró más de [10,000 vistas](https://www.tiktok.com/@criptopepe1/video/7517452244472614200), generando una lista de espera de 100+ usuarios sin marketing pagado. Esto demuestra la demanda genuina de soluciones cripto-fiat en Latinoamérica.

## 🛠 Stack Técnico Actual

- **Frontend**: Next.js 15 + React 19 + TailwindCSS + DaisyUI
- **Estado global**: Zustand
- **UI/UX**: Figma, Heroicons, RainbowKit
- **Notificaciones**: react-hot-toast
- **Temas**: next-themes
- **Barra de progreso**: next-nprogress-bar
- **Consultas**: TanStack React Query
- **Estilos utilitarios**: clsx, tailwind-merge
- **Backend/Blockchain**: (En desarrollo, integración futura con Mantle y Hardhat)
- **Despliegue**: Vercel

> **Nota:** El backend y la integración blockchain están en desarrollo. Actualmente el proyecto se centra en el frontend y la experiencia de usuario.

## ⚙️ Prerrequisitos

Asegúrate de tener instalado:

- [Node.js](https://nodejs.org/en/download/) (>= v20.18.3)
- [Yarn](https://classic.yarnpkg.com/en/docs/install/) (v1 o v2+)
- [Git](https://git-scm.com/downloads)

## 🚀 Comenzando

### 1. Clona e instala dependencias
```bash
git clone https://github.com/YOUR_USERNAME/kibo.git
cd kibo
yarn install
```

### 2. Configura el entorno
Crea `.env.local` en `packages/nextjs/` con tus credenciales Privy:
```bash
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
```

### 3. Desarrollo local
Inicia la aplicación frontend:
```bash
yarn start
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la app.

> **Próximamente:** Integración con Mantle, Hardhat y despliegue de contratos inteligentes.

