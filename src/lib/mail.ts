import nodemailer from "nodemailer"

// Transporter: Ethereal (Dev) oder SMTP (Produktion)
let transporter: nodemailer.Transporter | null = null

async function getTransporter() {
  if (transporter) return transporter

  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (smtpHost && smtpUser && smtpPass) {
    // Produktion: Echter SMTP-Server
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || "587"),
      secure: smtpPort === "465",
      auth: { user: smtpUser, pass: smtpPass },
    })
  } else {
    // Entwicklung: Ethereal (fake-SMTP, Mails landen im Browser)
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    })
    console.log("📧 Ethereal-Mail: User =", testAccount.user)
  }

  return transporter
}

export async function sendMail(
  to: string,
  subject: string,
  html: string
): Promise<{ messageId?: string; previewUrl?: string }> {
  try {
    const t = await getTransporter()
    const info = await t.sendMail({
      from: process.env.SMTP_FROM || '"Smart Fit" <noreply@smart-fitness.de>',
      to,
      subject,
      html,
    })
    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined
    if (previewUrl) {
      console.log("📧 E-Mail-Vorschau:", previewUrl)
    }
    return { messageId: info.messageId, previewUrl }
  } catch (error) {
    console.error("❌ Mail-Fehler:", error)
    return {}
  }
}

// Hilfsfunktionen für häufige Mail-Typen

export async function sendKursErinnerung(
  email: string,
  vorname: string,
  kursName: string,
  datum: string,
  uhrzeit: string,
  raumName: string
) {
  return sendMail(
    email,
    `📅 Erinnerung: ${kursName} heute`,
    `<h2>${kursName}</h2>
     <p>Hallo ${vorname},</p>
     <p>nur eine freundliche Erinnerung: Dein Kurs <strong>${kursName}</strong> findet heute um <strong>${uhrzeit}</strong> in <strong>${raumName}</strong> statt.</p>
     <p>Wir freuen uns auf Dich!</p>
     <p>Dein Smart Fit Team</p>`
  )
}

export async function sendStornoBenachrichtigung(
  email: string,
  vorname: string,
  kursName: string,
  datum: string,
  uhrzeit: string
) {
  return sendMail(
    email,
    `❌ Kurs abgesagt: ${kursName}`,
    `<h2>Kurs abgesagt</h2>
     <p>Hallo ${vorname},</p>
     <p>leider muss der Kurs <strong>${kursName}</strong> am ${datum} um ${uhrzeit} abgesagt werden.</p>
     <p>Deine Buchung wurde kostenfrei storniert. Du kannst gerne einen anderen Kurs buchen.</p>
     <p>Dein Smart Fit Team</p>`
  )
}

export async function sendWartelisteBenachrichtigung(
  email: string,
  vorname: string,
  kursName: string,
  datum: string,
  uhrzeit: string
) {
  return sendMail(
    email,
    `⚡ Platz freigeworden: ${kursName}`,
    `<h2>Platz verfügbar!</h2>
     <p>Hallo ${vorname},</p>
     <p>es wurde ein Platz im Kurs <strong>${kursName}</strong> am ${datum} um ${uhrzeit} frei.</p>
     <p>Bitte innerhalb von <strong>60 Minuten</strong> in der App bestätigen, sonst verfällt der Anspruch.</p>
     <p>Dein Smart Fit Team</p>`
  )
}
