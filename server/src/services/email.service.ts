import nodemailer from 'nodemailer';

interface WelcomeEmailParams {
  email: string;
  username: string;
  lang: 'en' | 'es';
}

const templates = {
  en: {
    subject: "Welcome to NFL Pick'em Lottery!",
    title: "Welcome aboard, {username}!",
    body: "We are thrilled to have you in our league. Get ready to make your picks for the upcoming NFL games and climb the leaderboard!",
    button: "Go to Dashboard"
  },
  es: {
    subject: "¡Bienvenido a la Lotería NFL Pick'em!",
    title: "¡Bienvenido a bordo, {username}!",
    body: "Estamos encantados de tenerte en nuestra liga. ¡Prepárate para hacer tus pronósticos para los próximos partidos de la NFL y subir en la tabla de posiciones!",
    button: "Ir al Panel"
  }
};

export const sendWelcomeEmail = async ({ email, username, lang }: WelcomeEmailParams) => {
  const template = templates[lang] || templates.en;
  const content = template.body.replace('{username}', username);
  const title = template.title.replace('{username}', username);

  // For production, you would configure a real transporter (SMTP, SendGrid, etc.)
  // For this prototype, we will log to console to demonstrate the logic.
  
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

  // Mocking success
  return true;
};
