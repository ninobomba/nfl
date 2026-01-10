import nodemailer from 'nodemailer';

interface WelcomeEmailParams {
  email: string;
  username: string;
  lang: 'en' | 'es';
}

const templates = {
  en: {
    subject: "Welcome to NFL Ultimate Challenge!",
    title: "Welcome aboard, {username}!",
    body: "We are thrilled to have you in our league. Get ready to make your picks for the upcoming NFL games and climb the leaderboard!",
    button: "Go to Dashboard"
  },
  es: {
    subject: "¡Bienvenido a la NFL Ultimate Challenge!",
    title: "¡Bienvenido a bordo, {username}!",
    body: "Estamos encantados de tenerte en nuestra liga. ¡Prepárate para hacer tus pronósticos para los próximos partidos de la NFL y subir en la tabla de posiciones!",
    button: "Ir al Panel"
  }
};

const resetTemplates = {
  en: {
    subject: "Your Password Reset Key",
    title: "Password Reset Request",
    body: "You requested a password reset. Use the following key to complete the process: {key}. This key will expire in 15 minutes.",
  },
  es: {
    subject: "Tu Clave de Recuperación",
    title: "Solicitud de Cambio de Contraseña",
    body: "Has solicitado restablecer tu contraseña. Usa la siguiente clave para completar el proceso: {key}. Esta clave expirará en 15 minutos.",
  }
};

export const sendWelcomeEmail = async ({ email, username, lang }: WelcomeEmailParams) => {
  const template = templates[lang] || templates.en;
  const content = template.body.replace('{username}', username);
  const title = template.title.replace('{username}', username);

  console.log(`
    --- MOCK EMAIL SENT ---
    To: ${email}
    Subject: ${template.subject}
    Content:
    ${title}
    ${content}
    Action: ${template.button}
    ------------------------
  `);

  return true;
};

export const sendResetKeyEmail = async (email: string, key: string, lang: 'en' | 'es') => {
  const template = resetTemplates[lang] || resetTemplates.en;
  const content = template.body.replace('{key}', key);

  console.log(`
    --- MOCK RESET EMAIL SENT ---
    To: ${email}
    Subject: ${template.subject}
    Content:
    ${template.title}
    ${content}
    -----------------------------
  `);
  return true;
};