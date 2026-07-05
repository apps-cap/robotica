export const GRADOS = [
  { value: "K3", label: "Kínder 3" },
  { value: "PRIMARIA_1_2", label: "1° y 2° de Primaria" },
  { value: "PRIMARIA_4", label: "4° de Primaria" },
];

export const PERIODOS = [
  { value: "P1", label: "P1 · Ago-Nov" },
  { value: "P2", label: "P2 · Dic-Feb" },
  { value: "P3", label: "P3 · Mar-May" },
  { value: "P4", label: "P4 · Jun-Jul" },
];

export const TIPOS_RETO = [
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "EQUIPO", label: "Equipo" },
];

export const EVENTOS = [
  { value: "WRO_MEXICO", label: "WRO México" },
  { value: "INFOMATRIX", label: "Infomatrix (SOLACYT)" },
  { value: "EXPOCIENCIAS", label: "Expociencias" },
];

export const ESTADOS_EQUIPO = [
  { value: "CANDIDATO", label: "Candidato" },
  { value: "SELECCIONADO", label: "Seleccionado" },
  { value: "NO_SELECCIONADO", label: "No seleccionado" },
];

export const CRITERIOS_RUBRICA = [
  { key: "funcionalidad", label: "Funcionalidad de la solución" },
  { key: "procesoDiseno", label: "Proceso de diseño (prueba, error, mejora)" },
  { key: "trabajoColaborativo", label: "Trabajo colaborativo y roles" },
  { key: "comunicacion", label: "Comunicación del proyecto" },
  { key: "creatividad", label: "Creatividad e innovación" },
];

export const ESTADOS_ASISTENCIA = [
  { value: "PRESENTE", label: "Presente" },
  { value: "AUSENTE", label: "Ausente" },
  { value: "RETARDO", label: "Retardo" },
];

export const PUNTAJE_MAX_CRITERIO = 4;
export const PUNTAJE_MAX_TOTAL = CRITERIOS_RUBRICA.length * PUNTAJE_MAX_CRITERIO;

export function labelGrado(value) {
  return GRADOS.find((g) => g.value === value)?.label ?? value;
}

export function labelPeriodo(value) {
  return PERIODOS.find((p) => p.value === value)?.label ?? value;
}

export function labelEvento(value) {
  return EVENTOS.find((e) => e.value === value)?.label ?? value;
}
