[
	{
		"table": "APLICACIONES",
		"columns": [
			{
				"name": "id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "posicion_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "estudiante_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "curriculum_version_id",
				"type": "uuid",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "created_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": "CURRENT_TIMESTAMP"
			},
			{
				"name": "updated_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "estado",
				"type": "USER-DEFINED",
				"nullable": "NO",
				"default": "'PENDIENTE'::\"AplicacionEstado\""
			}
		],
		"primary_keys": [
			"id"
		],
		"foreign_keys": [
			{
				"column": "curriculum_version_id",
				"references": "CURRICULUM_VERSIONES.id"
			},
			{
				"column": "estudiante_id",
				"references": "ESTUDIANTES.user_id"
			},
			{
				"column": "posicion_id",
				"references": "POSICIONES.id"
			}
		]
	},
	{
		"table": "CONNECTIONS",
		"columns": [
			{
				"name": "id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "sender_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "receiver_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "status",
				"type": "text",
				"nullable": "NO",
				"default": "'pending'::text"
			},
			{
				"name": "created_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": "CURRENT_TIMESTAMP"
			},
			{
				"name": "updated_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": null
			}
		],
		"primary_keys": [
			"id"
		],
		"foreign_keys": [
			{
				"column": "receiver_id",
				"references": "USERS.id"
			},
			{
				"column": "sender_id",
				"references": "USERS.id"
			}
		]
	},
	{
		"table": "CURRICULUM",
		"columns": [
			{
				"name": "id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "estudiante_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "habilidades_tecnicas",
				"type": "jsonb",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "idiomas",
				"type": "jsonb",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "created_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": "CURRENT_TIMESTAMP"
			},
			{
				"name": "updated_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": null
			}
		],
		"primary_keys": [
			"id"
		],
		"foreign_keys": [
			{
				"column": "estudiante_id",
				"references": "ESTUDIANTES.user_id"
			}
		]
	},
	{
		"table": "CURRICULUM_CERTIFICACIONES",
		"columns": [
			{
				"name": "id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "curriculum_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "nombre",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "institucion",
				"type": "text",
				"nullable": "YES",
				"default": null
			}
		],
		"primary_keys": [
			"id"
		],
		"foreign_keys": [
			{
				"column": "curriculum_id",
				"references": "CURRICULUM.id"
			}
		]
	},
	{
		"table": "CURRICULUM_EXPERIENCIA",
		"columns": [
			{
				"name": "id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "curriculum_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "tipo",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "titulo",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "organizacion",
				"type": "text",
				"nullable": "YES",
				"default": null
			}
		],
		"primary_keys": [
			"id"
		],
		"foreign_keys": [
			{
				"column": "curriculum_id",
				"references": "CURRICULUM.id"
			}
		]
	},
	{
		"table": "CURRICULUM_VERSIONES",
		"columns": [
			{
				"name": "id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "curriculum_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "posicion_id",
				"type": "uuid",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "nombre_version",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "created_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": "CURRENT_TIMESTAMP"
			},
			{
				"name": "updated_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": null
			}
		],
		"primary_keys": [
			"id"
		],
		"foreign_keys": [
			{
				"column": "curriculum_id",
				"references": "CURRICULUM.id"
			},
			{
				"column": "posicion_id",
				"references": "POSICIONES.id"
			}
		]
	},
	{
		"table": "DONACIONES",
		"columns": [
			{
				"name": "id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "exalumno_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "proyecto_estudiante_id",
				"type": "uuid",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "monto",
				"type": "numeric",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "moneda",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "metodo_pago",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "confirmado_por",
				"type": "uuid",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "created_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": "CURRENT_TIMESTAMP"
			},
			{
				"name": "updated_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "comprobante_url",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "destino",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "estado",
				"type": "USER-DEFINED",
				"nullable": "NO",
				"default": "'PENDIENTE'::\"DonacionEstado\""
			}
		],
		"primary_keys": [
			"id"
		],
		"foreign_keys": [
			{
				"column": "exalumno_id",
				"references": "EXALUMNOS.user_id"
			},
			{
				"column": "proyecto_estudiante_id",
				"references": "ESTUDIANTES.user_id"
			}
		]
	},
	{
		"table": "ESTUDIANTES",
		"columns": [
			{
				"name": "user_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "carnet_ucr",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "carrera",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "escuela_facultad",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "sede",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "anio_ingreso",
				"type": "integer",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "nivel_academico",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "promedio_ponderado",
				"type": "numeric",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "proyecto_titulo",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "proyecto_tipo",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "busca_financiamiento",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "busca_mentoria",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "busca_empleo",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "busca_pasantia",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "nivel_beca",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "proyecto_descripcion",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "proyecto_necesidades",
				"type": "jsonb",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "proyecto_porcentaje_avance",
				"type": "integer",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "visible_en_directorio",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "area_tematica",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "areas_interes",
				"type": "jsonb",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "habilidades",
				"type": "jsonb",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "beca_socioeconomica",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "fecha_nacimiento",
				"type": "date",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "activo",
				"type": "boolean",
				"nullable": "YES",
				"default": null
			}
		],
		"primary_keys": [
			"user_id"
		],
		"foreign_keys": [
			{
				"column": "user_id",
				"references": "USERS.id"
			}
		]
	},
	{
		"table": "EXALUMNOS",
		"columns": [
			{
				"name": "user_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "carnet_ucr",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "escuela_facultad",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "anio_graduacion",
				"type": "integer",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "empresa_actual",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "cargo_actual",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "pais_ciudad",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "anios_experiencia",
				"type": "integer",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "linkedin_url",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "ofrece_mentoria",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "ofrece_empleo",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "ofrece_pasantia",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "ofrece_proyecto",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "ofrece_donacion_dinero",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "biografia",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "github_url",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "website_url",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "habilidades",
				"type": "jsonb",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "certificaciones",
				"type": "jsonb",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "experiencia_laboral",
				"type": "jsonb",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "ofrece_guest_speaking",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "ofrece_volunteering",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "ofrece_career_advice",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "ofrece_networking",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "areas_interes",
				"type": "jsonb",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "carrera",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "perfil_completo",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "sector",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "visible_en_directorio",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			}
		],
		"primary_keys": [
			"user_id"
		],
		"foreign_keys": [
			{
				"column": "user_id",
				"references": "USERS.id"
			}
		]
	},
	{
		"table": "MATCHES",
		"columns": [
			{
				"name": "id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "exalumno_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "estudiante_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "tipo_apoyo",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "score_match",
				"type": "integer",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "resultado",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "created_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": "CURRENT_TIMESTAMP"
			},
			{
				"name": "updated_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "initiated_by",
				"type": "text",
				"nullable": "YES",
				"default": "'sistema'::text"
			},
			{
				"name": "match_reasons",
				"type": "jsonb",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "accepted_at",
				"type": "timestamp without time zone",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "rejected_at",
				"type": "timestamp without time zone",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "closed_at",
				"type": "timestamp without time zone",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "rechazado_por_estudiante",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "estado",
				"type": "USER-DEFINED",
				"nullable": "NO",
				"default": "'SUGERIDO'::\"MatchEstado\""
			}
		],
		"primary_keys": [
			"id"
		],
		"foreign_keys": [
			{
				"column": "estudiante_id",
				"references": "ESTUDIANTES.user_id"
			},
			{
				"column": "exalumno_id",
				"references": "EXALUMNOS.user_id"
			}
		]
	},
	{
		"table": "MATCH_HISTORY",
		"columns": [
			{
				"name": "id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "match_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "old_status",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "new_status",
				"type": "text",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "changed_by",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "created_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": "CURRENT_TIMESTAMP"
			},
			{
				"name": "updated_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": null
			}
		],
		"primary_keys": [
			"id"
		],
		"foreign_keys": [
			{
				"column": "match_id",
				"references": "MATCHES.id"
			}
		]
	},
	{
		"table": "MESSAGES",
		"columns": [
			{
				"name": "id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "match_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "sender_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "content",
				"type": "text",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "created_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": "CURRENT_TIMESTAMP"
			}
		],
		"primary_keys": [
			"id"
		],
		"foreign_keys": [
			{
				"column": "match_id",
				"references": "MATCHES.id"
			},
			{
				"column": "sender_id",
				"references": "USERS.id"
			}
		]
	},
	{
		"table": "NOTIFICATIONS",
		"columns": [
			{
				"name": "id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "user_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "title",
				"type": "text",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "message",
				"type": "text",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "type",
				"type": "text",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "read",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "created_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": "CURRENT_TIMESTAMP"
			},
			{
				"name": "updated_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": null
			}
		],
		"primary_keys": [
			"id"
		],
		"foreign_keys": [
			{
				"column": "user_id",
				"references": "USERS.id"
			}
		]
	},
	{
		"table": "POSICIONES",
		"columns": [
			{
				"name": "id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "exalumno_id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "tipo",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "titulo",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "modalidad",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "jornada",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "empresa",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "fecha_limite",
				"type": "timestamp without time zone",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "estado",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "created_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": "CURRENT_TIMESTAMP"
			},
			{
				"name": "updated_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "area_estudio",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "beneficios",
				"type": "jsonb",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "descripcion",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "hard_skills",
				"type": "jsonb",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "horario",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "idiomas_requeridos",
				"type": "jsonb",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "matching_weights",
				"type": "jsonb",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "nivel_grado_minimo",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "responsabilidades",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "soft_skills",
				"type": "jsonb",
				"nullable": "YES",
				"default": null
			}
		],
		"primary_keys": [
			"id"
		],
		"foreign_keys": [
			{
				"column": "exalumno_id",
				"references": "EXALUMNOS.user_id"
			}
		]
	},
	{
		"table": "REPORTES_PERFIL",
		"columns": [
			{
				"name": "id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "reportado_por",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "perfil_reportado",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "motivo",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "resuelto",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "created_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": "CURRENT_TIMESTAMP"
			},
			{
				"name": "updated_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": null
			}
		],
		"primary_keys": [
			"id"
		],
		"foreign_keys": [
			{
				"column": "perfil_reportado",
				"references": "USERS.id"
			},
			{
				"column": "reportado_por",
				"references": "USERS.id"
			}
		]
	},
	{
		"table": "USERS",
		"columns": [
			{
				"name": "id",
				"type": "uuid",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "email",
				"type": "text",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "nombre",
				"type": "text",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "email_verified",
				"type": "boolean",
				"nullable": "NO",
				"default": "false"
			},
			{
				"name": "foto_url",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "activo",
				"type": "boolean",
				"nullable": "NO",
				"default": "true"
			},
			{
				"name": "reportes_recibidos",
				"type": "integer",
				"nullable": "NO",
				"default": "0"
			},
			{
				"name": "created_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": "CURRENT_TIMESTAMP"
			},
			{
				"name": "updated_at",
				"type": "timestamp without time zone",
				"nullable": "NO",
				"default": null
			},
			{
				"name": "cedula",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "fecha_nacimiento",
				"type": "date",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "genero",
				"type": "text",
				"nullable": "YES",
				"default": null
			},
			{
				"name": "status",
				"type": "USER-DEFINED",
				"nullable": "NO",
				"default": "'PENDIENTE'::\"UserStatus\""
			},
			{
				"name": "report_count",
				"type": "integer",
				"nullable": "NO",
				"default": "0"
			},
			{
				"name": "tipo",
				"type": "USER-DEFINED",
				"nullable": "NO",
				"default": "'ESTUDIANTE'::\"UserTipo\""
			}
		],
		"primary_keys": [
			"id"
		],
		"foreign_keys": null
	}
]