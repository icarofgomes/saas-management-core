import moment from 'moment';

/**
 * Converte uma string no formato 'DD/MM/YYYY' para um objeto Date compatível com Sequelize.
 * @param dateStr Data no formato 'DD/MM/YYYY'
 * @returns Objeto Date
 */
export function convertToSequelize(dateStr: string): Date {
  const converted = moment(dateStr, 'DD/MM/YYYY', true);

  if (!converted.isValid()) {
    throw new Error(
      `Formato de data inválido: ${dateStr}. Esperado: DD/MM/YYYY`,
    );
  }

  return converted.toDate();
}
