import axios from 'axios';

async function generarRutinaConIA({ message, altura, peso, objetivo, nombre }) {
    const palabrasRutina = ['rutina', 'ejercicio', 'entrenamiento', 'workout', 'entrenar',
        'pecho', 'espalda', 'triceps', 'biceps', 'pierna', 'isquios', 'brazo', 'abdomen', 'hombro', 'cuadriceps',
        'tren superior', 'tren inferior', 'cardio', 'gimnasio'];

    const contieneRutina = palabrasRutina.some(palabra =>
        message.toLowerCase().includes(palabra.toLowerCase())
    );

    const saludos = ['hola', 'buenas', 'hey', 'hi', 'buenos días', 'buenas tardes', 'buenas noches'];
    const esSoloSaludo = saludos.some(saludo =>
        message.toLowerCase().includes(saludo)
    ) && !contieneRutina && message.length < 20;

    let prompt = '';

    if (esSoloSaludo) {
        prompt = `Como entrenador personal de FitManage, saluda brevemente a ${nombre}. Puedes usar emojis, pero no muchos`;
    } else if (contieneRutina) {
        prompt = `No saludes ni al inicio ni al final.Como entrenador personal experto de FitManage, diseña una rutina personalizada para ${nombre}, Puedes emojis, pero no te excedas.

Datos importantes:
Altura: ${altura}cm | Peso: ${peso}kg | Objetivo: ${objetivo}

Su consulta es: "${message}"

La rutina debe incluir:
• Breve introducción personalizada (No coloques este título en la respuesta)
• Ejercicios de calentamiento
• Rutina principal con ejercicios detallados (series, repeticiones, técnica)
• Recomendaciones de descanso e hidratación

Importante:
• Mantén un tono profesional y motivador
• Sé específico pero conciso
• Evita formatos complejos o símbolos especiales
• Responde en español`;
    } else {
        prompt = `No saludes ni al inicio ni al final.Como entrenador personal de FitManage, responde a  ${message} 
        Datos: (${altura}cm, ${peso}kg) quien busca ${objetivo}.
• Usa emojis relevantes, pero no demasiados.

Proporciona una respuesta profesional, específica y basada en tu experiencia en fitness y nutrición. No te extiendas demasiado, se ordenado`;
    }

    const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
            model: 'deepseek/deepseek-r1-0528:free',
            messages: [
                { role: 'system', content: 'Entrenador personal experto en fitness y nutrición.' },
                { role: 'user', content: prompt }
            ]
        },
        {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': `${process.env.URL_BACKEND}`,
                'X-Title': 'FitManage-AI-Chat'
            }
        }
    );
    console.log('Respuesta completa de OpenRouter:', response.data);

    return response.data.choices[0].message.content;
}

export default {
    generarRutinaConIA,
};
