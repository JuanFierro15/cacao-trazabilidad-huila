package co.edu.usco.cacao.excepcion;

import java.util.List;

public class ReglaNegocioException extends RuntimeException {

    private final CodigoError codigoError;
    private final List<ErrorCampoDTO> errores;
    private final Long transformacionId;

    public ReglaNegocioException(CodigoError codigoError, String mensaje) {
        this(codigoError, mensaje, List.of(), null);
    }

    public ReglaNegocioException(CodigoError codigoError, String mensaje, List<ErrorCampoDTO> errores) {
        this(codigoError, mensaje, errores, null);
    }

    public ReglaNegocioException(
        CodigoError codigoError,
        String mensaje,
        List<ErrorCampoDTO> errores,
        Long transformacionId
    ) {
        super(mensaje);
        this.codigoError = codigoError;
        this.errores = errores == null ? List.of() : List.copyOf(errores);
        this.transformacionId = transformacionId;
    }

    public CodigoError getCodigoError() {
        return codigoError;
    }

    public List<ErrorCampoDTO> getErrores() {
        return errores;
    }

    public Long getTransformacionId() {
        return transformacionId;
    }

    public static ReglaNegocioException validacion(String campo, String mensajeCampo, String mensajeGeneral) {
        return new ReglaNegocioException(
            CodigoError.VALIDACION,
            mensajeGeneral,
            List.of(new ErrorCampoDTO(campo, mensajeCampo))
        );
    }

    public static ReglaNegocioException credencialesInvalidas() {
        return new ReglaNegocioException(
            CodigoError.CREDENCIALES_INVALIDAS,
            "Usuario o contraseña incorrectos. Verifique las credenciales e intente nuevamente."
        );
    }

    public static ReglaNegocioException noEncontrado(String mensaje) {
        return new ReglaNegocioException(CodigoError.NO_ENCONTRADO, mensaje);
    }

    public static ReglaNegocioException loteDuplicado(String codigoLote) {
        return new ReglaNegocioException(
            CodigoError.LOTE_DUPLICADO,
            "El código de lote " + codigoLote + " ya está registrado. Ingrese un código distinto o déjelo vacío para asignación automática."
        );
    }

    public static ReglaNegocioException operacionDuplicada(String uuid, Long transformacionId) {
        return new ReglaNegocioException(
            CodigoError.OPERACION_DUPLICADA,
            "La operación " + uuid + " ya fue procesada previamente. No se descontó inventario por segunda vez.",
            List.of(),
            transformacionId
        );
    }

    public static ReglaNegocioException loteBloqueado(String codigoLote) {
        return new ReglaNegocioException(
            CodigoError.LOTE_BLOQUEADO,
            "El lote " + codigoLote + " se encuentra BLOQUEADO y no puede ser transformado."
        );
    }

    public static ReglaNegocioException origenBloqueado(String codigoLote, String codigoAncestro) {
        return new ReglaNegocioException(
            CodigoError.ORIGEN_BLOQUEADO,
            "No se puede liberar el lote " + codigoLote + " porque su lote de origen " + codigoAncestro + " está BLOQUEADO."
        );
    }

    public static ReglaNegocioException estadoSinCambio(String codigoLote, String estado) {
        return new ReglaNegocioException(
            CodigoError.ESTADO_SIN_CAMBIO,
            "El lote " + codigoLote + " ya se encuentra en estado " + estado + ". No se registró ningún cambio."
        );
    }

    public static ReglaNegocioException inventarioInsuficiente(String mensaje) {
        return new ReglaNegocioException(CodigoError.INVENTARIO_INSUFICIENTE, mensaje);
    }

    public static ReglaNegocioException salidaSinJustificacion() {
        return new ReglaNegocioException(
            CodigoError.SALIDA_SIN_JUSTIFICACION,
            "La cantidad de salida supera la cantidad de entrada. Debe indicar los insumos agregados que justifican el aumento de peso."
        );
    }

    public static ReglaNegocioException usuarioDuplicado(String username) {
        return new ReglaNegocioException(
            CodigoError.USUARIO_DUPLICADO,
            "El nombre de usuario '" + username + "' ya está registrado. Elija un nombre de usuario distinto.",
            List.of(new ErrorCampoDTO("username", "Este nombre de usuario ya está en uso."))
        );
    }

    public static ReglaNegocioException operacionNoPermitida(String mensaje) {
        return new ReglaNegocioException(CodigoError.OPERACION_NO_PERMITIDA, mensaje);
    }
}
