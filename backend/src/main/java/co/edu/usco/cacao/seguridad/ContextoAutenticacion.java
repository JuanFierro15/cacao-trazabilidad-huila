package co.edu.usco.cacao.seguridad;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class ContextoAutenticacion {

    public String obtenerUsernameActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            return "sistema";
        }
        return auth.getName();
    }

    public String obtenerRolActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null) {
            return "OPERADOR";
        }
        return auth.getAuthorities()
            .stream()
            .map(GrantedAuthority::getAuthority)
            .filter(a -> a.startsWith("ROLE_"))
            .map(a -> a.substring("ROLE_".length()))
            .findFirst()
            .orElse("OPERADOR");
    }
}
