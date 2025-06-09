import RutinaService from '../services/RutinaService.js';


async function generarRutina(req, res) {

    const { message, altura, peso, objetivo, nombre } = req.body;

    try {
        const resultado = await RutinaService.generarRutinaConIA({ message, altura, peso, objetivo, nombre });
        res.json({ response: resultado });
    } catch (error) {
        console.error(error?.response?.data || error.message);
        res.status(500).json({ error: 'Error al generar la rutina con IA' });
    }
};

export default { generarRutina, };