package co.edu.usco.cacao.dominio;

public enum Etapa {
    BENEFICIO_FERMENTACION_SECADO("Beneficio: fermentación y secado"),
    LIMPIEZA_CLASIFICACION("Limpieza y clasificación"),
    TOSTADO_ROASTING("Tostado"),
    DESCASCARILLADO_WINNOWING("Descascarillado (nibs)"),
    MOLIENDA_LICOR_CACAO("Molienda a licor de cacao"),
    CONTROL_CALIDAD_EMPAQUE("Control de calidad y empaque");

    private final String nombre;

    Etapa(String nombre) {
        this.nombre = nombre;
    }

    public String getNombre() {
        return nombre;
    }
}
