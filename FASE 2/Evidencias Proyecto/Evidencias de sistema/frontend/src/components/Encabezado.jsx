import { Link, useNavigate } from 'react-router-dom';
import { useSesion } from '../context/SesionContext.jsx';
import Icono from './Icono.jsx';
import { Logo } from './PantallaAcceso.jsx';

export default function Encabezado() {
  const { sesion, cerrarSesion } = useSesion();
  const navegar = useNavigate();

  const salir = async () => {
    await cerrarSesion();
    navegar('/iniciar-sesion', { replace: true });
  };

  return (
    <header className="encabezado">
      <Link to="/" className="encabezado__marca" aria-label="FitSearch, ir al inicio"><Logo /></Link>
      {sesion && (
        <nav className="encabezado__nav" aria-label="Sesión">
          <span className="avatar" aria-hidden="true">{sesion.usuario.nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')}</span>
          <span className="encabezado__usuario">{sesion.usuario.nombre}</span>
          <button type="button" className="boton boton--secundario" onClick={salir}>
            <Icono nombre="salir" tamano={18} /> <span className="encabezado__texto-salir">Cerrar sesión</span>
          </button>
        </nav>
      )}
    </header>
  );
}
