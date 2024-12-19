import { User, NotificationType } from '@prisma/client'
import nodemailer from 'nodemailer'
import twilio from 'twilio'

const emailTransporter = nodemailer.createTransport({
  // Configure your email service here
})

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function sendNotifications(users: User[], type: NotificationType, message: string) {
  for (const user of users) {
    switch (type) {
      case 'EMAIL':
        await sendEmail(user.email, message)
        break
      case 'SMS':
        await sendSMS(user.phone, message)
        break
      case 'WHATSAPP':
        await sendWhatsApp(user.phone, message)
        break
    }
  }
}

async function sendEmail(email: string, message: string) {
  await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Shift Booking Notification',
    text: message,
  })
}

async function sendSMS(phone: string, message: string) {
  await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  })
}

async function sendWhatsApp(phone: string, message: string) {
  await twilioClient.messages.create({
    body: message,
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${phone}`,
  })
}

