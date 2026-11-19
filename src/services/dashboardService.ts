import { sql } from '@/lib/db';

export interface PacienteSemRetorno {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  ultima_consulta: string;
  dias_desde_consulta: number;
}

export interface DashboardStats {
  totalPacientes: number;
  consultasSemana: number;
  pacientesSemRetorno: PacienteSemRetorno[];
}

export async function fetchDashboardData(nutricionistaId: string): Promise<DashboardStats> {
  if (!nutricionistaId) {
    return {
      totalPacientes: 0,
      consultasSemana: 0,
      pacientesSemRetorno: [],
    };
  }

  try {
    // 1. Total de pacientes cadastrados pela nutricionista logada
    const totalPacientesRes = await sql`
      SELECT count(*)::int as count 
      FROM public.pacientes 
      WHERE nutricionista_id = ${nutricionistaId}
    `;
    const totalPacientes = totalPacientesRes?.[0]?.count ? Number(totalPacientesRes[0].count) : 0;

    // 2. Consultas da semana atual
    const consultasSemanaRes = await sql`
      SELECT count(*)::int as count
      FROM public.consultas c
      JOIN public.pacientes p ON p.id = c.paciente_id
      WHERE p.nutricionista_id = ${nutricionistaId}
        AND c.data_consulta >= date_trunc('week', CURRENT_DATE)::date
        AND c.data_consulta <= (date_trunc('week', CURRENT_DATE) + interval '6 days')::date
    `;
    const consultasSemana = consultasSemanaRes?.[0]?.count ? Number(consultasSemanaRes[0].count) : 0;

    // 3. Pacientes cuja última consulta foi há mais de 30 dias e que não possuem próximo retorno agendado
    const pacientesSemRetornoRes = await sql`
      SELECT 
        p.id,
        p.nome,
        p.email,
        p.telefone,
        MAX(c.data_consulta)::text as ultima_consulta,
        (CURRENT_DATE - MAX(c.data_consulta))::int as dias_desde_consulta
      FROM public.pacientes p
      JOIN public.consultas c ON c.paciente_id = p.id
      WHERE p.nutricionista_id = ${nutricionistaId}
      GROUP BY p.id, p.nome, p.email, p.telefone
      HAVING MAX(c.data_consulta) < CURRENT_DATE - INTERVAL '30 days'
         AND NOT EXISTS (
           SELECT 1 FROM public.consultas c2 
           WHERE c2.paciente_id = p.id 
             AND c2.proximo_retorno IS NOT NULL 
             AND c2.proximo_retorno >= CURRENT_DATE
         )
      ORDER BY MAX(c.data_consulta) ASC
    `;

    const pacientesSemRetorno: PacienteSemRetorno[] = (pacientesSemRetornoRes || []).map((row: any) => ({
      id: row.id,
      nome: row.nome,
      email: row.email,
      telefone: row.telefone,
      ultima_consulta: row.ultima_consulta,
      dias_desde_consulta: Number(row.dias_desde_consulta || 0),
    }));

    return {
      totalPacientes,
      consultasSemana,
      pacientesSemRetorno,
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard no Neon:', error);
    throw error;
  }
}

