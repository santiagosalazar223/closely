import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

// ─── Rate limiting (in-memory, resets on cold start) ────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;        // max requests
const RATE_WINDOW = 60_000;  // per 60 seconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ─── CIIU sector data (Damodaran) ────────────────────────────────────────────
const CIIU_TABLE = `
CODIGO_CIIU | SECTOR | WACC_PCT | KE_PCT | KD_PCT | BETA_LEVERED | D/E
A  | Agricultura, ganadería, caza, silvicultura y pesca | 17.2 | 20.6 | 13.5 | 1.51 | 0.519
B  | Explotación de minas y canteras                    | 16.7 | 17.9 | 15.0 | 1.14 | 0.376
C1 | Manufactura – Alimentos y bebidas                  | 14.8 | 15.4 | 13.5 | 0.79 | 0.437
C2 | Manufactura – Química y farmacéutica               | 16.5 | 18.3 | 14.0 | 1.19 | 0.299
C3 | Manufactura – Otros                                | 16.2 | 17.3 | 14.0 | 1.05 | 0.148
D  | Suministro electricidad, gas y vapor               | 12.3 | 13.6 | 12.0 | 0.54 | 0.767
E  | Distribución agua y gestión de desechos            | 15.8 | 17.5 | 12.0 | 1.08 | 0.214
F  | Construcción                                       | 17.8 | 19.2 | 15.0 | 1.32 | 0.141
G  | Comercio al por mayor y menor                      | 15.9 | 17.5 | 14.0 | 1.08 | 0.286
H  | Transporte y almacenamiento                        | 16.2 | 18.0 | 14.0 | 1.15 | 0.338
I  | Alojamiento y servicios de comida                  | 17.0 | 18.6 | 15.5 | 1.23 | 0.351
J1 | Información y comunicaciones – Telecom             | 15.2 | 17.1 | 13.5 | 1.02 | 0.961
J3 | Información y comunicaciones – Software            | 18.7 | 19.3 | 14.5 | 1.33 | 0.056
K  | Actividades financieras y de seguros               | 13.9 | 28.9 | 13.0 | 2.68 | 2.720
L  | Actividades inmobiliarias                          | 15.1 | 19.6 | 13.0 | 1.38 | 1.018
M  | Actividades profesionales y técnicas               | 15.5 | 16.9 | 14.5 | 1.00 | 0.197
N  | Actividades de servicios administrativos           | 15.5 | 16.9 | 14.5 | 1.00 | 0.197
P  | Educación                                          | 14.8 | 16.2 | 12.5 | 0.90 | 0.244
R  | Actividades artísticas y entretenimiento           | 16.7 | 19.1 | 15.0 | 1.31 | 0.630
S  | Otras actividades de servicios                     | 15.5 | 16.9 | 14.0 | 1.00 | 0.197
`;

const SYSTEM_PROMPT = `Eres un senior de banca de inversión con 20+ años de experiencia en valoración de empresas en mercados emergentes latinoamericanos (Colombia, México, Argentina, Chile).
Tienes profundo conocimiento en:
- Modelos DCF (Flujos de Caja Descontados)
- Valoración por múltiplos comparables (EV/EBITDA, EV/Revenue, P/E)
- Valoración por activos netos ajustados
- Normas NIIF y US GAAP
- Damodaran methodology para mercados emergentes
- Prima de riesgo país LATAM

Tu objetivo es analizar estados financieros de una empresa y producir una valoración profesional, rigurosa y justificada.

INSTRUCCIONES CRÍTICAS:
1. Extrae TODOS los datos financieros disponibles del documento (ingresos, EBITDA, EBIT, utilidad neta, activos, pasivos, flujo de caja, etc.)
2. Si algún dato no está disponible, haz supuestos EXPLÍCITOS y razonables basados en benchmarks del sector
3. Usa la tabla CIIU proporcionada para obtener el WACC, Ke, Kd y Beta del sector correspondiente
4. Aplica SIEMPRE los 3 métodos de valoración y pondera los resultados
5. Para el DCF, proyecta 5 años con supuestos de crecimiento coherentes con el sector y el tamaño de la empresa
6. Para múltiplos, usa los benchmarks de Damodaran para el sector específico
7. Ajusta por prima de iliquidez (20-30% descuento para empresas privadas pequeñas)
8. Ajusta por riesgo país Colombia: añade 3-5% al WACC base
9. Sé conservador pero justo. No sobrevalores ni subvalores arbitrariamente.
10. Responde ÚNICAMENTE con el JSON estructurado especificado, sin texto adicional

TABLA CIIU/DAMODARAN (usa estos parámetros según el sector de la empresa):
${CIIU_TABLE}`;

const USER_PROMPT_TEMPLATE = (businessName: string, sector: string, extraContext: string) => `
Analiza los estados financieros adjuntos de la empresa "${businessName}" que opera en el sector "${sector}".

${extraContext ? `Información adicional del negocio: ${extraContext}` : ""}

Genera una valoración completa en el siguiente formato JSON exacto (sin markdown, solo JSON puro):

{
  "resumen_ejecutivo": "string - 3-4 oraciones resumiendo el negocio y la valoración",
  "sector_identificado": "string - sector CIIU identificado",
  "codigo_ciiu": "string - código CIIU (A, B, C1, C2, etc.)",
  "wacc_usado": number,
  "datos_financieros_extraidos": {
    "ingresos_anuales": number,
    "ebitda": number,
    "margen_ebitda_pct": number,
    "ebit": number,
    "utilidad_neta": number,
    "total_activos": number,
    "total_pasivos": number,
    "patrimonio": number,
    "flujo_caja_libre": number,
    "deuda_financiera_neta": number,
    "año_datos": string,
    "supuestos_aplicados": ["string"]
  },
  "metodologias": {
    "dcf": {
      "valor_empresa_usd": number,
      "valor_patrimonio_usd": number,
      "tasa_crecimiento_terminal_pct": number,
      "tasa_crecimiento_proyectado_pct": number,
      "proyecciones_fcl": [
        {"año": 1, "fcl_usd": number},
        {"año": 2, "fcl_usd": number},
        {"año": 3, "fcl_usd": number},
        {"año": 4, "fcl_usd": number},
        {"año": 5, "fcl_usd": number}
      ],
      "ponderacion_pct": 50,
      "justificacion": "string"
    },
    "multiplos": {
      "ev_ebitda_multiplo_sector": number,
      "ev_revenue_multiplo_sector": number,
      "valor_por_ev_ebitda_usd": number,
      "valor_por_ev_revenue_usd": number,
      "valor_promedio_multiplos_usd": number,
      "ponderacion_pct": 35,
      "justificacion": "string"
    },
    "activos_netos": {
      "valor_libros_patrimonio_usd": number,
      "ajuste_activos_intangibles_usd": number,
      "valor_ajustado_usd": number,
      "ponderacion_pct": 15,
      "justificacion": "string"
    }
  },
  "ajustes": {
    "prima_iliquidez_pct": number,
    "prima_riesgo_pais_pct": number,
    "descuento_empresa_pequena_pct": number,
    "ajuste_total_pct": number
  },
  "valoracion_final": {
    "valor_bajo_usd": number,
    "valor_medio_usd": number,
    "valor_alto_usd": number,
    "valor_recomendado_usd": number,
    "moneda": "USD",
    "nota_conversion": "string - si los datos están en COP o MXN, indica la tasa usada"
  },
  "factores_clave_valor": ["string"],
  "factores_riesgo": ["string"],
  "recomendaciones_vendedor": ["string"],
  "nivel_confianza": "alto|medio|bajo",
  "razon_confianza": "string",
  "disclaimer": "Esta valoración es referencial y no constituye asesoría financiera oficial. Se recomienda validar con un asesor certificado."
}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function validateFile(file: File): string | null {
  const ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg", "image/jpg", "image/png", "image/webp",
    "text/csv", "text/plain",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Tipo de archivo no permitido: ${file.type}. Usa PDF, imágenes, CSV o Excel.`;
  }
  if (file.size > MAX_SIZE) {
    return `El archivo supera el límite de 10 MB (tamaño: ${(file.size / 1024 / 1024).toFixed(1)} MB).`;
  }
  return null;
}

async function buildMessageContent(
  file: File,
  businessName: string,
  sector: string,
  extraContext: string
): Promise<Anthropic.MessageParam> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const userText = USER_PROMPT_TEMPLATE(businessName, sector, extraContext);

  // PDF document
  if (file.type === "application/pdf") {
    return {
      role: "user",
      content: [
        {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: base64 },
        } as Anthropic.DocumentBlockParam,
        { type: "text", text: userText },
      ],
    };
  }

  // Images
  if (file.type.startsWith("image/")) {
    const mediaType = file.type as "image/jpeg" | "image/png" | "image/webp";
    return {
      role: "user",
      content: [
        {
          type: "image",
          source: { type: "base64", media_type: mediaType, data: base64 },
        } as Anthropic.ImageBlockParam,
        { type: "text", text: userText },
      ],
    };
  }

  // CSV / TXT / Excel → send as text
  const textContent = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  return {
    role: "user",
    content: [
      {
        type: "text",
        text: `ESTADOS FINANCIEROS (contenido del archivo "${file.name}"):\n\n${textContent}\n\n---\n\n${userText}`,
      },
    ],
  };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  // 1. Rate limit
  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Espera 1 minuto antes de intentarlo de nuevo." },
      { status: 429 }
    );
  }

  // 2. API key check
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Servicio de valoración no configurado." },
      { status: 503 }
    );
  }

  // 3. Parse form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Error al procesar el formulario." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const businessName = (formData.get("businessName") as string | null)?.slice(0, 200) ?? "Empresa";
  const sector = (formData.get("sector") as string | null)?.slice(0, 100) ?? "No especificado";
  const extraContext = (formData.get("extraContext") as string | null)?.slice(0, 1000) ?? "";

  // 4. Validate file
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }
  const fileError = validateFile(file);
  if (fileError) {
    return NextResponse.json({ error: fileError }, { status: 400 });
  }

  // 5. Build message and call Claude
  try {
    const client = new Anthropic({ apiKey });
    const message = await buildMessageContent(file, businessName, sector, extraContext);

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [message],
    });

    const rawText = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as Anthropic.TextBlock).text)
      .join("");

    // Extract JSON (handle markdown fences if any)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "El modelo no devolvió un JSON válido. Intenta con un archivo más claro." },
        { status: 422 }
      );
    }

    const valuation = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, valuation });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[valuation] Error calling Claude:", message);
    return NextResponse.json(
      { error: "Error al procesar la valoración. Verifica el archivo e intenta de nuevo." },
      { status: 500 }
    );
  }
}

// Only POST allowed
export async function GET() {
  return NextResponse.json({ error: "Método no permitido." }, { status: 405 });
}
