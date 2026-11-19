/**
 * Controlador para la verificación del estado de salud de la API.
 */

export const getHealth = (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      message: 'API funcionando correctamente'
    }
  });
};

export default {
  getHealth
};
