package co.edu.usco.cacao.servicio;

import co.edu.usco.cacao.dominio.Rol;
import co.edu.usco.cacao.dominio.Usuario;
import co.edu.usco.cacao.excepcion.ReglaNegocioException;
import co.edu.usco.cacao.repositorio.UsuarioRepository;
import co.edu.usco.cacao.seguridad.ContextoAutenticacion;
import co.edu.usco.cacao.web.dto.UsuarioActualizacionSolicitudDTO;
import co.edu.usco.cacao.web.dto.UsuarioCreacionSolicitudDTO;
import co.edu.usco.cacao.web.dto.UsuarioDTO;
import java.util.List;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioServicio {

    private static final String ENTIDAD_USUARIO = "USUARIO";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final ContextoAutenticacion contextoAutenticacion;
    private final AuditoriaServicio auditoriaServicio;

    public UsuarioServicio(
        UsuarioRepository usuarioRepository,
        PasswordEncoder passwordEncoder,
        ContextoAutenticacion contextoAutenticacion,
        AuditoriaServicio auditoriaServicio
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.contextoAutenticacion = contextoAutenticacion;
        this.auditoriaServicio = auditoriaServicio;
    }

    @Transactional(readOnly = true)
    public List<UsuarioDTO> listarUsuarios() {
        return usuarioRepository.findAllByOrderByRolAscUsernameAsc()
            .stream()
            .map(UsuarioDTO::de)
            .toList();
    }

    @Transactional
    public UsuarioDTO crearOperador(UsuarioCreacionSolicitudDTO solicitud) {
        String usernameNormalizado = solicitud.username().trim().toLowerCase(Locale.ROOT);
        if (usernameNormalizado.length() < 3) {
            throw ReglaNegocioException.validacion(
                "username",
                "El nombre de usuario debe tener al menos 3 caracteres.",
                "Los datos del operador no son válidos."
            );
        }

        if (usuarioRepository.existsByUsername(usernameNormalizado)) {
            throw ReglaNegocioException.usuarioDuplicado(usernameNormalizado);
        }

        String nombreLimpio = solicitud.nombreCompleto().trim();
        String passwordLimpia = solicitud.password().trim();
        if (passwordLimpia.length() < 6) {
            throw ReglaNegocioException.validacion(
                "password",
                "La contraseña debe tener al menos 6 caracteres.",
                "Los datos del operador no son válidos."
            );
        }

        Usuario nuevo = new Usuario(
            usernameNormalizado,
            passwordEncoder.encode(passwordLimpia),
            nombreLimpio,
            Rol.OPERADOR,
            true
        );

        Usuario guardado = usuarioRepository.save(nuevo);

        auditoriaServicio.registrar(
            "CREAR",
            ENTIDAD_USUARIO,
            guardado.getUsername(),
            "rol",
            null,
            guardado.getRol().name() + " (" + guardado.getNombreCompleto() + ")",
            "Creación de cuenta de operador"
        );

        return UsuarioDTO.de(guardado);
    }

    @Transactional
    public UsuarioDTO actualizarUsuario(Long id, UsuarioActualizacionSolicitudDTO solicitud) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> ReglaNegocioException.noEncontrado(
                "No se encontró el usuario con identificador " + id + "."
            ));

        String usernameActual = contextoAutenticacion.obtenerUsernameActual();
        boolean esPropioUsuario = usuario.getUsername().equalsIgnoreCase(usernameActual);

        String nombreAnterior = usuario.getNombreCompleto();
        String nombreNuevo = solicitud.nombreCompleto().trim();
        if (nombreNuevo.isEmpty()) {
            throw ReglaNegocioException.validacion(
                "nombreCompleto",
                "El nombre completo no puede estar vacío.",
                "Los datos enviados no son válidos."
            );
        }

        if (!nombreAnterior.equals(nombreNuevo)) {
            usuario.setNombreCompleto(nombreNuevo);
            auditoriaServicio.registrar(
                "ACTUALIZAR",
                ENTIDAD_USUARIO,
                usuario.getUsername(),
                "nombre_completo",
                nombreAnterior,
                nombreNuevo,
                "Actualización de nombre completo"
            );
        }

        if (solicitud.passwordNueva() != null && !solicitud.passwordNueva().isBlank()) {
            String nuevaClave = solicitud.passwordNueva().trim();
            if (nuevaClave.length() < 6) {
                throw ReglaNegocioException.validacion(
                    "passwordNueva",
                    "La nueva contraseña debe tener al menos 6 caracteres.",
                    "Los datos enviados no son válidos."
                );
            }

            if (esPropioUsuario) {
                if (solicitud.passwordActual() == null || solicitud.passwordActual().isBlank()) {
                    throw ReglaNegocioException.validacion(
                        "passwordActual",
                        "Debe ingresar su contraseña actual para confirmar el cambio.",
                        "Se requiere la contraseña actual para cambiar la clave del administrador."
                    );
                }
                if (!passwordEncoder.matches(solicitud.passwordActual(), usuario.getPasswordHash())) {
                    throw ReglaNegocioException.validacion(
                        "passwordActual",
                        "La contraseña actual ingresada es incorrecta.",
                        "La contraseña actual no coincide."
                    );
                }
            }

            usuario.setPasswordHash(passwordEncoder.encode(nuevaClave));
            auditoriaServicio.registrar(
                "ACTUALIZAR",
                ENTIDAD_USUARIO,
                usuario.getUsername(),
                "password_hash",
                "[PROTEGIDO]",
                "[ACTUALIZADO]",
                esPropioUsuario
                    ? "Cambio de contraseña por el propio administrador"
                    : "Restablecimiento de contraseña por el administrador"
            );
        }

        if (solicitud.activo() != null && solicitud.activo() != usuario.isActivo()) {
            if (esPropioUsuario && !solicitud.activo()) {
                throw ReglaNegocioException.operacionNoPermitida(
                    "No puede desactivar su propia cuenta de administrador mientras tiene la sesión activa."
                );
            }
            if (usuario.getRol() == Rol.ADMINISTRADOR && !solicitud.activo()
                && usuarioRepository.countByRolAndActivoTrue(Rol.ADMINISTRADOR) <= 1) {
                throw ReglaNegocioException.operacionNoPermitida(
                    "No se puede desactivar el único administrador activo del sistema."
                );
            }
            boolean estadoAnterior = usuario.isActivo();
            usuario.setActivo(solicitud.activo());
            auditoriaServicio.registrar(
                "CAMBIO_ESTADO",
                ENTIDAD_USUARIO,
                usuario.getUsername(),
                "activo",
                estadoAnterior ? "ACTIVO" : "INACTIVO",
                solicitud.activo() ? "ACTIVO" : "INACTIVO",
                solicitud.activo() ? "Activación de cuenta de usuario" : "Suspensión de cuenta de usuario"
            );
        }

        Usuario guardado = usuarioRepository.save(usuario);
        return UsuarioDTO.de(guardado);
    }

    @Transactional
    public void eliminarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> ReglaNegocioException.noEncontrado(
                "No se encontró el usuario con identificador " + id + "."
            ));

        String usernameActual = contextoAutenticacion.obtenerUsernameActual();
        if (usuario.getUsername().equalsIgnoreCase(usernameActual)) {
            throw ReglaNegocioException.operacionNoPermitida(
                "No puede eliminar su propia cuenta de administrador."
            );
        }

        if (usuario.getRol() == Rol.ADMINISTRADOR) {
            throw ReglaNegocioException.operacionNoPermitida(
                "Las cuentas con rol de administrador no pueden eliminarse."
            );
        }

        String usernameEliminado = usuario.getUsername();
        String nombreEliminado = usuario.getNombreCompleto();
        usuarioRepository.delete(usuario);

        auditoriaServicio.registrar(
            "ELIMINAR",
            ENTIDAD_USUARIO,
            usernameEliminado,
            "estado_cuenta",
            "OPERADOR (" + nombreEliminado + ")",
            "ELIMINADO",
            "Eliminación de cuenta de operador por el administrador"
        );
    }
}
