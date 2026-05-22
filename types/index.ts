export interface Farm {
  id: string;
  name: string;
  code?: string;
  location?: string;
  region?: string;
  manager?: string;
  manager_email?: string;
  phone?: string;
  farm_type?: "Arrendada" | "Propia" | "Integrada";
  operative_type?: "Engorde" | "Reproductora";
  capacity?: number;
  barns_count?: number;
  status?: "activa" | "inactiva" | "mantenimiento";
  risk_level?: "critico" | "alto" | "medio" | "bajo";
  sanitary_status?: "optimo" | "alerta" | "critico";
  latitude?: number;
  longitude?: number;
  notes?: string;
  created_date?: string;
  updated_date?: string;
}

export interface Barn {
  id: string;
  farm_id: string;
  name: string;
  type?: "engorde" | "ponedoras" | "reproductoras" | "incubación" | "otro";
  capacity?: number;
  area_m2?: number;
  status?: "activo" | "vacio" | "mantenimiento";
  notes?: string;
}

export interface Audit {
  id: string;
  farm_id: string;
  barn_id?: string;
  title: string;
  type: "bioseguridad" | "bienestar" | "alimentacion" | "sanidad" | "general" | "personalizado";
  status: "pendiente" | "en_proceso" | "completada" | "aprobada" | "rechazada";
  auditor?: string;
  auditor_email?: string;
  scheduled_date?: string;
  completed_date?: string;
  score?: number;
  checklist?: ChecklistItem[];
  summary?: string;
  created_date?: string;
  updated_date?: string;
}

export interface ChecklistItem {
  id: string;
  section: string;
  question: string;
  weight?: number;
  answer?: "si" | "no" | "na" | "pendiente";
  notes?: string;
}

export interface Finding {
  id: string;
  farm_id?: string;
  farm_name: string;
  farm_type: "Arrendada" | "Propia" | "Integrada";
  farm_operative_type: "Engorde" | "Reproductora";
  audit_id?: string;
  auditor: string;
  visit_date: string;
  title: string;
  description?: string;
  category: "Ambiental" | "Estructural / Equipos" | "Sanitario" | "Mortalidad" | "Financiero" | "Operativo" | "Alimento / Insumos" | "Documental";
  risk_types?: string[];
  severity: "critico" | "alto" | "medio" | "bajo" | "informativo";
  status: "abierto" | "en_proceso" | "cerrado" | "verificado";
  evidence_urls?: string[];
  observations?: string;
  action_plan?: string;
  responsible?: string;
  commitment_date?: string;
  follow_up?: string;
  created_date?: string;
  updated_date?: string;
}

export interface KPIPlan {
  id: string;
  finding_id?: string;
  farm_id?: string;
  farm_name: string;
  audit_id?: string;
  auditor?: string;
  title: string;
  description?: string;
  risk_types?: string[];
  severity: "critico" | "alto" | "medio" | "bajo" | "informativo";
  kpi_status: "completado" | "en_retraso" | "en_espera" | "no_iniciado" | "en_curso";
  responsible: string;
  commitment_date: string;
  completion_date?: string;
  progress_pct?: number;
  follow_up?: string;
  evidence_urls?: string[];
  visit_date?: string;
  last_followup_date?: string;
  notes?: string;
  created_date?: string;
  updated_date?: string;
}

export interface Inventory {
  id: string;
  farm_id: string;
  category: "alimento" | "medicina" | "insumo" | "equipo" | "otro";
  name: string;
  sku?: string;
  unit?: string;
  quantity?: number;
  min_stock?: number;
  unit_cost?: number;
  supplier?: string;
  expiry_date?: string;
  location?: string;
  notes?: string;
}

export interface Lot {
  id: string;
  farm_id: string;
  barn_id?: string;
  code: string;
  breed?: string;
  type: "engorde" | "ponedoras" | "reproductoras";
  quantity_in?: number;
  quantity_current?: number;
  entry_date?: string;
  expected_exit?: string;
  exit_date?: string;
  supplier?: string;
  status: "activo" | "finalizado" | "vendido";
  weight_target?: number;
  vaccinations?: Vaccination[];
  notes?: string;
}

export interface Vaccination {
  vaccine: string;
  date: string;
  dose?: string;
  applied_by?: string;
}

export interface Document {
  id: string;
  name: string;
  doc_type: "Política" | "Procedimiento" | "Evidencia" | "Informe" | "Plantilla" | "Otro";
  audit_id?: string;
  farm_id?: string;
  farm_name?: string;
  uploaded_by?: string;
  file_url?: string;
  file_size?: string;
  version?: string;
  status: "vigente" | "obsoleto" | "borrador";
  description?: string;
  tags?: string[];
  created_date?: string;
}

export interface AllowedUser {
  id: string;
  email: string;
  full_name?: string;
  role: "admin" | "auditor" | "operador" | "gerencia";
  is_active?: boolean;
  authorized_by?: string;
  notes?: string;
  last_access?: string;
  created_date?: string;
}

export interface AuditReport {
  id: string;
  title: string;
  report_type: "mensual" | "trimestral" | "anual" | "especial";
  farm_id?: string;
  farm_name?: string;
  period_start?: string;
  period_end?: string;
  audits_count?: number;
  findings_count?: number;
  critical_findings?: number;
  compliance_avg?: number;
  total_risk_score?: number;
  areas?: string[];
  conclusions?: string;
  recommendations?: string;
  generated_by?: string;
  status: "borrador" | "finalizado" | "aprobado";
  created_date?: string;
}

export interface ActivityLog {
  id: string;
  user_email: string;
  user_name?: string;
  action: string;
  module?: string;
  entity_type?: string;
  entity_id?: string;
  entity_name?: string;
  details?: string;
  ip?: string;
  created_date?: string;
}

export type EntityName =
  | "Farm" | "Barn" | "Audit" | "Finding" | "KPIPlan"
  | "Inventory" | "Lot" | "Document" | "AllowedUser"
  | "AuditReport" | "ActivityLog" | "Sensor" | "Telemetry"
  | "ActivityTemplate" | "User";

export interface Base44Response<T> {
  entities: T[];
  count: number;
  entityName: string;
}

export interface DashboardKPIs {
  totalFarms: number;
  activeFarms: number;
  totalFindings: number;
  criticalFindings: number;
  openFindings: number;
  verifiedFindings: number;
  totalKPIs: number;
  overdueKPIs: number;
  completedKPIs: number;
  activeAudits: number;
  totalCapacity: number;
  complianceAvg: number;
}
