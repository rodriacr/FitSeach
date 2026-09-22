const { tasaMetabolicaBasal, requerimientoCalorico } = require('../../src/services/nutricion.service');

describe('nutricion.service', () => {
  test('calcula la tasa metabólica basal con Mifflin-St Jeor según el sexo', () => {
    expect(tasaMetabolicaBasal({ pesoKg: 70, alturaCm: 175, edad: 30, sexo: 'masculino' })).toBeCloseTo(1648.75);
    expect(tasaMetabolicaBasal({ pesoKg: 60, alturaCm: 165, edad: 25, sexo: 'femenino' })).toBeCloseTo(1345.25);
  });

  test('multiplica la tasa basal por el factor de actividad física y redondea', () => {
    expect(requerimientoCalorico({ pesoKg: 70, alturaCm: 175, edad: 30, sexo: 'masculino', actividadFisica: 'moderada' })).toBe(2556);
    expect(requerimientoCalorico({ pesoKg: 60, alturaCm: 165, edad: 25, sexo: 'femenino', actividadFisica: 'sedentaria' })).toBe(1614);
  });

  test('devuelve null si falta algún dato o hay valores no permitidos', () => {
    expect(requerimientoCalorico({ pesoKg: 70, alturaCm: 175, edad: null, sexo: 'masculino', actividadFisica: 'moderada' })).toBeNull();
    expect(requerimientoCalorico({ pesoKg: 70, alturaCm: 175, edad: 30, sexo: null, actividadFisica: 'moderada' })).toBeNull();
    expect(requerimientoCalorico({ pesoKg: 70, alturaCm: 175, edad: 30, sexo: 'masculino', actividadFisica: 'extrema' })).toBeNull();
  });
});
