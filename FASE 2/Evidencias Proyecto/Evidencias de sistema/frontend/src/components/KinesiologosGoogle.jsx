import { useState } from 'react';

// Resultados externos: no se incorporan como cuentas o fichas de FitSearch.
export default function KinesiologosGoogle() {
  const [zona, setZona] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const consulta = `kinesiólogos en ${busqueda}`;
  const buscar = (evento) => {
    evento.preventDefault();
    if (zona.trim()) setBusqueda(zona.trim());
  };
  return <section className="directorio__google" aria-labelledby="google-kine-titulo">
    <span className="directorio__antetitulo">Búsqueda externa · Google Maps</span>
    <h2 id="google-kine-titulo">Kinesiólogos en Google Maps</h2>
    <p className="texto-secundario">Explora también los kinesiólogos de tu comuna o ciudad. Estos resultados pertenecen a Google Maps y no indican que estén registrados en FitSearch.</p>
    <form className="directorio__filtro" onSubmit={buscar}>
      <div className="campo">
        <label htmlFor="zona-google" className="campo__etiqueta">Comuna o ciudad</label>
        <input id="zona-google" className="campo__control" value={zona} onChange={(evento) => setZona(evento.target.value)}
          placeholder="Ej.: Melipilla, Chile" required maxLength={150} />
      </div>
      <button type="submit" className="boton boton--secundario boton--compacto">Buscar en Google Maps</button>
    </form>
    {busqueda && <>
      <p>Resultados externos para <strong>{busqueda}</strong></p>
      <iframe key={busqueda} title={`Kinesiólogos en ${busqueda} — Google Maps`}
        src={`https://maps.google.com/maps?q=${encodeURIComponent(consulta)}&output=embed`}
        loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      <p className="texto-secundario">Si el mapa no carga o quieres ver todas las fichas, abre la búsqueda directamente en Google Maps.</p>
      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`} target="_blank" rel="noopener noreferrer">Ver kinesiólogos en Google Maps ↗</a>
    </>}
  </section>;
}
