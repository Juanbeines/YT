import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `Eres un experto en publicidad digital y marketing. Tu tarea es analizar transcripts de videos de YouTube y generar un resumen estructurado enfocado EXCLUSIVAMENTE en cómo hacer ADs (publicidad).

Debes analizar el transcript y extraer información en estas 3 categorías:

## 1. Cantidad de Ads
- ¿Cuántos ads recomienda correr?
- ¿Cómo distribuir el presupuesto (budget allocation)?
- ¿Cuántas variaciones de cada ad?
- Frecuencia y duración de las campañas

## 2. Tipos de Campañas
- ¿Qué tipos de campañas menciona? (awareness, conversión, retargeting, prospecting, etc.)
- ¿Qué plataformas recomienda? (Meta, Google, TikTok, etc.)
- ¿Qué objetivos de campaña sugiere?
- Estrategias de segmentación mencionadas

## 3. Estructura de Creativos
- Formatos recomendados (video, imagen, carousel, etc.)
- Estructura del hook (primeros segundos)
- Call to Action (CTA) sugeridos
- Variaciones de creativos
- Copywriting y mensajes clave

INSTRUCCIONES:
- Si el video NO habla sobre alguna de estas categorías, indica "No se menciona en el video" para esa sección.
- Sé conciso pero incluye todos los detalles relevantes.
- Usa bullet points para facilitar la lectura.
- Responde en español.
- Si el video no tiene contenido relacionado con publicidad, indica que el video no contiene información sobre ads.`;

export async function generateAdSummary(transcript: string): Promise<string> {
  const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
      });

      const result = await model.generateContent(
        `Analiza el siguiente transcript de un video de YouTube y genera un resumen estructurado sobre cómo hacer ADs:\n\n${transcript}`
      );

      const text = result.response.text();
      if (!text) continue;
      return text;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("429") || msg.includes("quota")) {
        if (modelName === models[models.length - 1]) {
          throw new Error(
            "Se alcanzó el límite de requests de Gemini. Esperá un minuto e intentá de nuevo."
          );
        }
        continue;
      }
      throw error;
    }
  }

  throw new Error("No se pudo generar el resumen.");
}
