package co.edu.usco.cacao.servicio;

import co.edu.usco.cacao.dominio.AuditoriaCambio;
import co.edu.usco.cacao.repositorio.AuditoriaCambioRepository;
import co.edu.usco.cacao.seguridad.ContextoAutenticacion;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditoriaServicio {

    private final AuditoriaCambioRepository auditoriaCambioRepository;
    private final ContextoAutenticacion contextoAutenticacion;

    public AuditoriaServicio(
        AuditoriaCambioRepository auditoriaCambioRepository,
        ContextoAutenticacion contextoAutenticacion
    ) {
        this.auditoriaCambioRepository = auditoriaCambioRepository;
        this.contextoAutenticacion = contextoAutenticacion;
    }

    @Transactional
    public AuditoriaCambio registrar(
        String accion,
        String entidadAfectada,
        String registroReferencia,
        String campoModificado,
        String valorAnterior,
        String valorNuevo,
        String motivo
    ) {
        AuditoriaCambio cambio = new AuditoriaCambio();
        cambio.setUsuarioUsername(contextoAutenticacion.obtenerUsernameActual());
        cambio.setUsuarioRol(contextoAutenticacion.obtenerRolActual());
        cambio.setAccion(accion);
        cambio.setEntidadAfectada(entidadAfectada);
        cambio.setRegistroReferencia(registroReferencia);
        cambio.setCampoModificado(campoModificado);
        cambio.setValorAnterior(valorAnterior);
        cambio.setValorNuevo(valorNuevo);
        cambio.setMotivo(motivo);
        return auditoriaCambioRepository.save(cambio);
    }
}
