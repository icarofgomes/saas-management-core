export const ErrorMessages = {
  INVALID_CREDENTIALS: { message: 'Credenciais inválidas', statusCode: 401 },
  USER_NOT_FOUND: { message: 'Usuário não encontrado', statusCode: 404 },
  ROLE_NOT_FOUND: {
    message: 'Nível de permissão de usuário não encontrado',
    statusCode: 404,
  },
  PARENT_NOT_FOUND: { message: 'Responsável não encontrado', statusCode: 404 },
  ACCOUNT_DISABLED: { message: 'Conta desativada', statusCode: 403 },
  EMAIL_EXISTS: { message: 'E-mail já cadastrado', statusCode: 409 },
  PHONE_EXISTS: { message: 'Telefone já cadastrado', statusCode: 409 },
  CPF_EXISTS: { message: 'CPF já cadastrado', statusCode: 409 },
  FORBIDDEN_ADMIN_ONLY: {
    message: 'Apenas administradores podem executar esta ação',
    statusCode: 403,
  },
  FORBIDDEN_ACTION: {
    message: 'Este tipo de ação não é permitida para o usuário atual',
    statusCode: 403,
  },
  TOKEN_INVALID_OR_EXPIRED: {
    message: 'Código inválido ou expirado',
    statusCode: 400,
  },
  INVALID_ACTION: { message: 'Ação inválida', statusCode: 400 },
  ADDRESS_NOT_FOUND: { message: 'Endereço não encontrado', statusCode: 404 },
  ADDRESS_CREATE_FAILED: { message: 'Erro ao criar endereço', statusCode: 400 },
  ADDRESS_UPDATE_FAILED: {
    message: 'Erro ao atualizar endereço',
    statusCode: 400,
  },
  PASSWORD_RESET_TOKEN_INVALID: {
    message: 'Token de redefinição inválido ou expirado',
    statusCode: 400,
  },
  EMAIL_NOT_FOUND: { message: 'E-mail não encontrado', statusCode: 404 },
  RESEND_TOO_FREQUENT: {
    message: 'Aguarde 60s para solicitar novamente.',
    statusCode: 429,
  },
  RESEND_LIMIT_REACHED: {
    message: 'Limite de 5 reenvios em 30min atingido. Tente mais tarde.',
    statusCode: 429,
  },
  TOO_MANY_LOGIN_ATTEMPTS: {
    message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
    statusCode: 429,
  },
  STUDENT_NOT_FOUND: {
    statusCode: 404,
    message: 'Aluno não encontrado.',
  },
  TEACHER_NOT_FOUND: {
    code: 'TEACHER_NOT_FOUND',
    message: 'Professor(a) não encontrado(a).',
  },
  SUBJECT_ALREADY_EXISTS: {
    message: 'Matéria já cadastrada.',
    statusCode: 409,
  },
  INVALID_SUBJECT_IDS: {
    message: 'Uma ou mais matérias fornecidas são inválidas.',
    statusCode: 400,
  },
  SUBJECTS_REQUIRED: {
    message: 'É necessário informar ao menos uma matéria.',
    statusCode: 400,
  },
  UNIT_ALREADY_EXISTS: {
    message: 'Unidade com este nome já existe.',
    statusCode: 409,
  },
  UNIT_NOT_FOUND: {
    message: 'Unidade não encontrada.',
    statusCode: 404,
  },
  UNIT_MAX_ROOMS_REACHED: {
    message: 'Limite de salas atingido para esta unidade.',
    statusCode: 400,
  },
  ROOM_ALREADY_EXISTS_IN_UNIT: {
    message: 'Já existe uma sala com esse nome nesta unidade.',
    statusCode: 409,
  },
  NO_AVAILABLE_ROOM: {
    message: 'Nenhuma sala disponível para o horário selecionado.',
    statusCode: 400,
  },
  INVALID_LESSON_TIME: {
    message: 'Horário inválido: aulas devem iniciar entre 08:00 e 19:00.',
    statusCode: 400,
  },
  INVALID_LESSON_MINUTES: {
    message: 'Horário inválido: aulas só podem iniciar nos minutos 00 ou 30.',
    statusCode: 400,
  },
  TEACHER_DOES_NOT_TEACH_SUBJECT: {
    message: 'O(a) professor(a) selecionado(a) não ministra esta matéria.',
    statusCode: 400,
  },
  LESSON_NOT_FOUND: {
    message: 'Aula não encontrada.',
    statusCode: 404,
  },
  TEACHER_ALREADY_ASSIGNED_TO_THIS_TIME: {
    message:
      'O(a) professor(a) já está alocado(a) em outra aula neste horário.',
    statusCode: 400,
  },
  SCHEDULE_NOT_FOUND: {
    message: 'Agenda não encontrada.',
    statusCode: 404,
  },
  STUDENT_ALREADY_ENROLLED: {
    message: 'Aluno já está matriculado nesta aula.',
    statusCode: 409,
  },

  LESSON_ROOM_NOT_FOUND: {
    message: 'Sala da aula não encontrada.',
    statusCode: 404,
  },
  LESSON_FULL: {
    message: 'A aula já está cheia.',
    statusCode: 409,
  },
  PLAN_NOT_FOUND: {
    message: 'Plano não encontrado.',
    statusCode: 404,
  },
  PARENT_ID_REQUIRED: {
    message: 'ID do responsável é obrigatório',
    statusCode: 400,
  },
  INVOICE_NOT_FOUND: {
    message: 'Fatura não encontrada.',
    statusCode: 404,
  },

  PAYMENT_NOT_FOUND: {
    message: 'Pagamento não encontrado.',
    statusCode: 404,
  },

  INVOICE_ALREADY_PAID: {
    message: 'Esta fatura já está paga.',
    statusCode: 409,
  },

  PAYMENT_PROVIDER_NOT_FOUND: {
    message: 'Provider de pagamento não encontrado.',
    statusCode: 500,
  },

  PAYMENT_PROVIDER_FAILED: {
    message: 'Falha ao criar pagamento no provider.',
    statusCode: 502,
  },
};
