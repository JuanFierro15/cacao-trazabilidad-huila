package co.edu.usco.cacao.web;

import co.edu.usco.cacao.servicio.UsuarioServicio;
import co.edu.usco.cacao.web.dto.UsuarioActualizacionSolicitudDTO;
import co.edu.usco.cacao.web.dto.UsuarioCreacionSolicitudDTO;
import co.edu.usco.cacao.web.dto.UsuarioDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "9. Usuarios y Operadores", description = "Gestión exclusiva de administrador para cuentas de operadores y perfil propio")
public class UsuarioController {

    private final UsuarioServicio usuarioServicio;

    public UsuarioController(UsuarioServicio usuarioServicio) {
        this.usuarioServicio = usuarioServicio;
    }

    @GetMapping
    @Operation(
        summary = "[ADMINISTRADOR] Listar usuarios y operadores",
        description = "Devuelve todas las cuentas registradas sin exponer hashes de contraseña."
    )
    public ResponseEntity<List<UsuarioDTO>> listarUsuarios() {
        return ResponseEntity.ok(usuarioServicio.listarUsuarios());
    }

    @PostMapping
    @Operation(
        summary = "[ADMINISTRADOR] Registrar un nuevo operador",
        description = "Crea una nueva cuenta con rol OPERADOR, contraseña encriptada con BCrypt y registro en auditoría."
    )
    public ResponseEntity<UsuarioDTO> crearOperador(
        @Valid @RequestBody UsuarioCreacionSolicitudDTO solicitud
    ) {
        UsuarioDTO creado = usuarioServicio.crearOperador(solicitud);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @Operation(
        summary = "[ADMINISTRADOR] Actualizar datos, contraseña o estado de un usuario",
        description = "Permite actualizar el nombre completo y contraseña del propio administrador o de un operador, así como activar/suspender operadores."
    )
    public ResponseEntity<UsuarioDTO> actualizarUsuario(
        @PathVariable Long id,
        @Valid @RequestBody UsuarioActualizacionSolicitudDTO solicitud
    ) {
        UsuarioDTO actualizado = usuarioServicio.actualizarUsuario(id, solicitud);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "[ADMINISTRADOR] Eliminar cuenta de un operador",
        description = "Elimina un operador registrado y deja trazabilidad en la tabla de auditoría."
    )
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        usuarioServicio.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/eliminar")
    @Operation(
        summary = "[ADMINISTRADOR] Eliminar cuenta de un operador (alternativa POST)",
        description = "Elimina un operador registrado y deja trazabilidad en la tabla de auditoría."
    )
    public ResponseEntity<Void> eliminarUsuarioPost(@PathVariable Long id) {
        usuarioServicio.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}
