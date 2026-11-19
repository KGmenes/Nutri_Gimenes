import { sql } from '@/lib/db';

export interface Consulta {
  id: string;
  paciente_id: string;
  data_consulta: string;
  peso?: number | null;
  cintura?: number | null;
  quadril?: number | null;
  percentual_gordura?: number | null;
  observacoes?: string | null;
  proximo_retorno?: string | null;
  created_at: string;
}

export interface Paciente {
  id: string;
  nutricionista_id: string;
  nome: string;
  data_nascimento?: string | null;
  sexo?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  peso_inicial?: number | null;
  altura?: number | null;
  objetivos?: string[] | null;
  objetivo_texto?: string | null;
  nivel_atividade?: string | null;
  patologias?: string[] | null;
  restricoes_alimentares?: string[] | null;
  alergias?: string[] | null;
  medicamentos?: string | null;
  suplementos?: string | null;
  refeicoes_por_dia?: number | null;
  horario_acorda?: string | null;
  horario_dorme?: string | null;
  litros_agua?: number | null;
  atividade_fisica?: boolean | null;
  atividade_fisica_descricao?: string | null;
  observacoes?: string | null;
  created_at: string;
  total_consultas?: number;
  ultima_consulta?: string | null;
  proximo_retorno?: string | null;
}

export async function fetchPacientes(nutricionistaId: string): Promise<Paciente[]> {
  if (!nutricionistaId) return [];

  const rows = await sql`
    SELECT 
      p.*,
      COUNT(c.id)::int as total_consultas,
      MAX(c.data_consulta)::text as ultima_consulta,
      MAX(c.proximo_retorno)::text as proximo_retorno
    FROM public.pacientes p
    LEFT JOIN public.consultas c ON c.paciente_id = p.id
    WHERE p.nutricionista_id = ${nutricionistaId}
    GROUP BY p.id
    ORDER BY p.nome ASC
  `;

  return (rows || []).map((r: any) => ({
    ...r,
    total_consultas: Number(r.total_consultas || 0),
  }));
}

export async function fetchPacienteDetalhes(
  pacienteId: string,
  nutricionistaId: string
): Promise<{ paciente: Paciente; consultas: Consulta[] } | null> {
  const pacientes = await sql`
    SELECT * FROM public.pacientes 
    WHERE id = ${pacienteId} AND nutricionista_id = ${nutricionistaId}
  `;

  if (!pacientes || pacientes.length === 0) return null;

  const consultas = await sql`
    SELECT * FROM public.consultas 
    WHERE paciente_id = ${pacienteId}
    ORDER BY data_consulta DESC
  `;

  return {
    paciente: pacientes[0] as Paciente,
    consultas: (consultas || []) as Consulta[],
  };
}

export async function createPaciente(data: Partial<Paciente> & { nome: string; nutricionista_id: string }): Promise<Paciente> {
  const rows = await sql`
    INSERT INTO public.pacientes (
      nutricionista_id,
      nome,
      data_nascimento,
      sexo,
      telefone,
      whatsapp,
      email,
      peso_inicial,
      altura,
      objetivos,
      objetivo_texto,
      nivel_atividade,
      patologias,
      restricoes_alimentares,
      alergias,
      medicamentos,
      suplementos,
      refeicoes_por_dia,
      horario_acorda,
      horario_dorme,
      litros_agua,
      atividade_fisica,
      atividade_fisica_descricao,
      observacoes
    ) VALUES (
      ${data.nutricionista_id},
      ${data.nome},
      ${data.data_nascimento || null},
      ${data.sexo || null},
      ${data.telefone || null},
      ${data.whatsapp || null},
      ${data.email || null},
      ${data.peso_inicial || null},
      ${data.altura || null},
      ${data.objetivos || null},
      ${data.objetivo_texto || null},
      ${data.nivel_atividade || null},
      ${data.patologias || null},
      ${data.restricoes_alimentares || null},
      ${data.alergias || null},
      ${data.medicamentos || null},
      ${data.suplementos || null},
      ${data.refeicoes_por_dia || null},
      ${data.horario_acorda || null},
      ${data.horario_dorme || null},
      ${data.litros_agua || null},
      ${data.atividade_fisica !== undefined ? data.atividade_fisica : null},
      ${data.atividade_fisica_descricao || null},
      ${data.observacoes || null}
    )
    RETURNING *
  `;

  return rows[0] as Paciente;
}

export async function createConsulta(data: {
  paciente_id: string;
  data_consulta: string;
  peso?: number | null;
  cintura?: number | null;
  quadril?: number | null;
  percentual_gordura?: number | null;
  observacoes?: string | null;
  proximo_retorno?: string | null;
}): Promise<Consulta> {
  const rows = await sql`
    INSERT INTO public.consultas (
      paciente_id,
      data_consulta,
      peso,
      cintura,
      quadril,
      percentual_gordura,
      observacoes,
      proximo_retorno
    ) VALUES (
      ${data.paciente_id},
      ${data.data_consulta},
      ${data.peso || null},
      ${data.cintura || null},
      ${data.quadril || null},
      ${data.percentual_gordura || null},
      ${data.observacoes || null},
      ${data.proximo_retorno || null}
    )
    RETURNING *
  `;

  return rows[0] as Consulta;
}

