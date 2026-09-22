import { LogoGoogle } from './Icono.jsx';

// "Continuar con Google" (FS-HU-16). Queda desactivado hasta configurar VITE_GOOGLE_CLIENT_ID en frontend/.env.
export default function BotonGoogle({ texto = 'Continuar con Google', separador = 'o continúa con' }) {
  const configurado = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  return (
    <>
      <div className="separador"><span>{separador}</span></div>
      {/* El título va en el contenedor porque los navegadores no muestran tooltips sobre botones desactivados */}
      <div title={configurado ? undefined : 'Disponible próximamente'}>
        <button type="button" className="boton-social" disabled={!configurado} aria-describedby={configurado ? undefined : 'google-pendiente'}>
          <LogoGoogle />
          {texto}
        </button>
      </div>
      {!configurado && <span id="google-pendiente" className="solo-lector">Disponible próximamente</span>}
    </>
  );
}
