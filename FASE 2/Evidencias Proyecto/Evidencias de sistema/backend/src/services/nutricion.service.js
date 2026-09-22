// Estimaciones nutricionales a partir de los datos básicos del perfil (FS-HU-02; base del objetivo diario de FS-HU-10).
const { perfil: reglas } = require('../../../shared/reglas.json');

const AJUSTE_SEXO = { masculino: 5, femenino: -161 };

// Tasa metabólica basal con la ecuación de Mifflin-St Jeor (kcal/día).
function tasaMetabolicaBasal({ pesoKg, alturaCm, edad, sexo }) {
  return 10 * pesoKg + 6.25 * alturaCm - 5 * edad + AJUSTE_SEXO[sexo];
}

// Requerimiento calórico diario estimado = TMB × factor de actividad física. Devuelve null si faltan datos.
function requerimientoCalorico(datos) {
  const { pesoKg, alturaCm, edad, sexo, actividadFisica } = datos;
  const actividad = reglas.actividadFisica.find((opcion) => opcion.valor === actividadFisica);
  if ([pesoKg, alturaCm, edad].some((valor) => valor === null || valor === undefined) || !actividad || !(sexo in AJUSTE_SEXO)) {
    return null;
  }
  return Math.round(tasaMetabolicaBasal({ pesoKg, alturaCm, edad, sexo }) * actividad.factor);
}

module.exports = { tasaMetabolicaBasal, requerimientoCalorico };
