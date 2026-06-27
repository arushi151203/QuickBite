

import crypto from 'crypto'
import nodemailer from 'nodemailer'

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

let transporter = null

function getTransporter() {
  if (transporter) return transporter

  if (!process.env.SMTP_HOST) return null

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  return transporter
}

export function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

export async function sendEmail({ to, subject, html, text }) {
  const from = process.env.SMTP_FROM || 'QuickBite <noreply@quickbite.com>'
  const mail = { from, to, subject, html, text }

  const transport = getTransporter()

  if (!transport) {
    console.log('\n========== EMAIL (dev mode — no SMTP configured) ==========')
    console.log(`To:      ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(text || html.replace(/<[^>]+>/g, ' '))
    console.log('============================================================\n')
    return { devMode: true }
  }

  await transport.sendMail(mail)
  return { devMode: false }
}

export async function sendVerificationEmail(email, token) {
  const link = `${CLIENT_URL}/verify-email?token=${token}`
  const subject = 'Verify your QuickBite account'

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="color:#FF5E14;margin:0 0 8px">Welcome to QuickBite!</h2>
      <p style="color:#555;line-height:1.6">Thanks for signing up. Click the button below to verify your email and start ordering.</p>
      <a href="${link}" style="display:inline-block;background:#FF5E14;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;margin:24px 0">Verify Email</a>
      <p style="color:#999;font-size:13px">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      <p style="color:#999;font-size:12px;word-break:break-all">${link}</p>
    </div>
  `

  const text = `Verify your QuickBite account: ${link} (expires in 24 hours)`

  await sendEmail({ to: email, subject, html, text })
  return link
}

export async function sendPasswordResetEmail(email, token) {
  const link = `${CLIENT_URL}/reset-password?token=${token}`
  const subject = 'Reset your QuickBite password'

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="color:#FF5E14;margin:0 0 8px">Password Reset</h2>
      <p style="color:#555;line-height:1.6">We received a request to reset your password. Click below to choose a new one.</p>
      <a href="${link}" style="display:inline-block;background:#FF5E14;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;margin:24px 0">Reset Password</a>
      <p style="color:#999;font-size:13px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      <p style="color:#999;font-size:12px;word-break:break-all">${link}</p>
    </div>
  `

  const text = `Reset your QuickBite password: ${link} (expires in 1 hour)`

  await sendEmail({ to: email, subject, html, text })
  return link
}
