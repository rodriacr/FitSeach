import { useEffect, useState } from 'react';
import { solicitar } from '../services/api.js';
export default function FichasGoogle({ especialidad, zona }) {
  const consulta = JSON.stringify([especialidad, zona]);
  const [resultado, setResultado] = useState(null);
  const visible = resultado?.consulta === consulta ? resultado : null;
  useEffect(() => {
    if (!zona.trim()) return;
    let activo = true;
    const parametros = new URLSearchParams({ especialidad: especialidad || 'profesionales de salud y deporte', comuna: zona });
    solicitar('/google/profesionales?' + parametros, { conSesion: false })
      .then(datos => activo && setResultado({ consulta, datos }))
      .catch(error => activo && setResultado({ consulta, error: error.message }));
    return () => { activo = false; };
  }, [consulta, especialidad, zona]);
  if (!zona.trim()) return null;
  return <div className="directorio__fichas-google">
    {!visible && <p role="status">Buscando fichas de Google…</p>}
    {visible?.error && <p role="status">Google Maps: {visible.error}</p>}
        {visible?.datos && <section aria-label="Resultados de Google Maps" aria-live="polite">
      <p><strong>Google Maps</strong> · {visible.datos.profesionales.length} resultados</p>
      {visible.datos.profesionales.length === 0 && <p>No se encontraron lugares para esta búsqueda.</p>}
      {visible.datos.profesionales.map(p => <article className="directorio__tarjeta" key={p.id}>
        <div className="directorio__origen">Registrado en Google</div><h2>{p.nombre}</h2><div className="directorio__ubicacion"><span className="directorio__dato">LUGAR DE ATENCIÓN</span><p>{p.direccion}</p></div>
        {p.url?.startsWith('https://') && <a href={p.url} target="_blank" rel="noopener noreferrer">Ver en Google Maps ↗</a>}
        {(p.atribuciones || []).map((a, i) => <p key={i}>{a.providerUri?.startsWith('https://') ? <a href={a.providerUri} target="_blank" rel="noopener noreferrer">{a.provider}</a> : a.provider}</p>)}
      </article>)}
    </section>}

  </div>;
}
