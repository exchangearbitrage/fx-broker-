type ContactMail = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function sendContactMail(message: ContactMail) {
  console.info("[mail:contact]", {
    from: message.email,
    name: message.name,
    subject: message.subject,
    preview: message.message.slice(0, 160),
  });
}
