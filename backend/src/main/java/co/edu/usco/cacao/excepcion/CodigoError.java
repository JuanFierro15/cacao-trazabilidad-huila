package co.edu.usco.cacao.excepcion;

import org.springframework.http.HttpStatus;

public enum CodigoError {
    VALIDACION(HttpStatus.BAD_REQUEST),
    CREDENCIALES_INVALIDAS(HttpStatus.UNAUTHORIZED),
    NO_AUTENTICADO(HttpStatus.UNAUTHORIZED),
    ACCESO_DENEGADO(HttpStatus.FORBIDDEN),
    NO_ENCONTRADO(HttpStatus.NOT_FOUND),
    LOTE_DUPLICADO(HttpStatus.CONFLICT),
    OPERACION_DUPLICADA(HttpStatus.CONFLICT),
    LOTE_BLOQUEADO(HttpStatus.CONFLICT),
    ORIGEN_BLOQUEADO(HttpStatus.CONFLICT),
    ESTADO_SIN_CAMBIO(HttpStatus.CONFLICT),
    INVENTARIO_INSUFICIENTE(HttpStatus.UNPROCESSABLE_ENTITY),
    SALIDA_SIN_JUSTIFICACION(HttpStatus.UNPROCESSABLE_ENTITY),
    ERROR_INTERNO(HttpStatus.INTERNAL_SERVER_ERROR);

    private final HttpStatus httpStatus;

    CodigoError(HttpStatus httpStatus) {
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public int getStatusValue() {
        return httpStatus.value();
    }
}
