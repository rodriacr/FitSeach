// Error de negocio con código HTTP asociado; el middleware de errores lo transforma en respuesta JSON.
class ErrorHttp extends Error {
  constructor(estado, mensaje, detalles) {
    super(mensaje);
    this.name = 'ErrorHttp';
    this.estado = estado;
    this.detalles = detalles;
  }
}

module.exports = ErrorHttp;
