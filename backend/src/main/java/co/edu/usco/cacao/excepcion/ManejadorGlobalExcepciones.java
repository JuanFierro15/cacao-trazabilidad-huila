package co.edu.usco.cacao.excepcion;

import jakarta.validation.ConstraintViolationException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class ManejadorGlobalExcepciones {

    private static final Logger log = LoggerFactory.getLogger(ManejadorGlobalExcepciones.class);

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<ErrorRespuestaDTO> manejarReglaNegocio(ReglaNegocioException ex) {
        CodigoError codigo = ex.getCodigoError();
        ErrorRespuestaDTO cuerpo = ErrorRespuestaDTO.de(
            codigo,
            ex.getMessage(),
            ex.getErrores(),
            ex.getTransformacionId()
        );
        return ResponseEntity.status(codigo.getHttpStatus()).body(cuerpo);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorRespuestaDTO> manejarValidacion(MethodArgumentNotValidException ex) {
        List<ErrorCampoDTO> erroresCampo = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(err -> new ErrorCampoDTO(err.getField(), err.getDefaultMessage()))
            .toList();

        String mensaje = "Los datos enviados contienen errores de validación. Corrija los campos indicados e intente nuevamente.";
        ErrorRespuestaDTO cuerpo = ErrorRespuestaDTO.de(CodigoError.VALIDACION, mensaje, erroresCampo);
        return ResponseEntity.status(CodigoError.VALIDACION.getHttpStatus()).body(cuerpo);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorRespuestaDTO> manejarViolacionRestriccion(ConstraintViolationException ex) {
        List<ErrorCampoDTO> erroresCampo = ex.getConstraintViolations()
            .stream()
            .map(v -> new ErrorCampoDTO(v.getPropertyPath().toString(), v.getMessage()))
            .toList();

        ErrorRespuestaDTO cuerpo = ErrorRespuestaDTO.de(
            CodigoError.VALIDACION,
            "Parámetros de consulta inválidos. Verifique los valores enviados.",
            erroresCampo
        );
        return ResponseEntity.status(CodigoError.VALIDACION.getHttpStatus()).body(cuerpo);
    }

    @ExceptionHandler({
        HttpMessageNotReadableException.class,
        MethodArgumentTypeMismatchException.class,
        MissingServletRequestParameterException.class,
        IllegalArgumentException.class
    })
    public ResponseEntity<ErrorRespuestaDTO> manejarFormatoSolicitud(Exception ex) {
        String mensaje = "El formato de los datos enviados no es válido. Verifique los tipos de datos, fechas y valores permitidos.";
        ErrorRespuestaDTO cuerpo = ErrorRespuestaDTO.de(CodigoError.VALIDACION, mensaje);
        return ResponseEntity.status(CodigoError.VALIDACION.getHttpStatus()).body(cuerpo);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorRespuestaDTO> manejarAutenticacion(AuthenticationException ex) {
        ErrorRespuestaDTO cuerpo = ErrorRespuestaDTO.de(
            CodigoError.NO_AUTENTICADO,
            "Debe iniciar sesión con un token válido para acceder a este recurso."
        );
        return ResponseEntity.status(CodigoError.NO_AUTENTICADO.getHttpStatus()).body(cuerpo);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorRespuestaDTO> manejarAccesoDenegado(AccessDeniedException ex) {
        ErrorRespuestaDTO cuerpo = ErrorRespuestaDTO.de(
            CodigoError.ACCESO_DENEGADO,
            "Solo el Administrador puede realizar esta operación."
        );
        return ResponseEntity.status(CodigoError.ACCESO_DENEGADO.getHttpStatus()).body(cuerpo);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorRespuestaDTO> manejarRecursoNoEncontrado(NoResourceFoundException ex) {
        ErrorRespuestaDTO cuerpo = ErrorRespuestaDTO.de(
            CodigoError.NO_ENCONTRADO,
            "La ruta solicitada no existe."
        );
        return ResponseEntity.status(CodigoError.NO_ENCONTRADO.getHttpStatus()).body(cuerpo);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorRespuestaDTO> manejarErrorInesperado(Exception ex) {
        log.error("Error inesperado al procesar la solicitud", ex);
        ErrorRespuestaDTO cuerpo = ErrorRespuestaDTO.de(
            CodigoError.ERROR_INTERNO,
            "Ocurrió un error interno al procesar la solicitud. Intente nuevamente."
        );
        return ResponseEntity.status(CodigoError.ERROR_INTERNO.getHttpStatus()).body(cuerpo);
    }
}
