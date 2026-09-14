import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { guardarSesion, leerSesionGuardada, registrarManejadorSesionExpirada } from '../services/api.js';
import * as authService from '../services/auth.service.js';

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesionGuardada);
  const [avisoSesion, setAvisoSesion] = useState('');

  const establecer = useCallback((nuevaSesion) => {
    guardarSesion(nuevaSesion);
    setSesion(nuevaSesion);
  }, []);

  useEffect(() => {
    registrarManejadorSesionExpirada(() => {
      establecer(null);
      setAvisoSesion('Tu sesión expiró. Inicia sesión nuevamente.');
    });
  }, [establecer]);

  const valor = useMemo(() => ({
    sesion,
    avisoSesion,
    limpiarAviso: () => setAvisoSesion(''),
    registrar: async (datos) => establecer(await authService.registrar(datos)),
    iniciarSesion: async (datos) => establecer(await authService.iniciarSesion(datos)),
    cerrarSesion: async () => {
      try {
        await authService.cerrarSesion();
      } catch {
        // El token se descarta igual en el cliente aunque el servidor no responda.
      }
      establecer(null);
    },
  }), [sesion, avisoSesion, establecer]);

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSesion() {
  const contexto = useContext(SesionContext);
  if (!contexto) throw new Error('useSesion debe usarse dentro de SesionProvider');
  return contexto;
}
