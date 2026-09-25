export default function KinesiologosGoogle({ especialidad = '', zona = 'Melipilla, Chile' }) {
  const consulta = (especialidad || 'profesionales de salud y deporte') + ' en ' + (zona || 'Chile');
  return <aside className="directorio__google" aria-labelledby="mapa-titulo">
    <h2 id="mapa-titulo">Explora en el mapa</h2>
    <p className="texto-secundario">Google Maps · {zona || 'Chile'}</p>
    <iframe title={consulta + ' — Google Maps'} src={'https://maps.google.com/maps?q=' + encodeURIComponent(consulta) + '&output=embed'} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
    <a href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(consulta)} target="_blank" rel="noopener noreferrer">Ver más resultados en Google Maps ↗</a>
    <p className="directorio__fuente">Los lugares del mapa provienen de Google y pueden no estar registrados en FitSearch.</p>
  </aside>;
}
