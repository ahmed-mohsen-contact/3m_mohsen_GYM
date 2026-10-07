import { useState, type FormEvent } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { Card } from '../components/Card'
import { FormField, TextareaField } from '../components/FormFields'
import { Loader } from '../components/Loader'
import { PageHeader } from '../components/PageHeader'
import { isValidEmail } from '../utils/format'

interface ContactFormState {
  name: string
  email: string
  subject: string
  message: string
}

const initialForm: ContactFormState = { name: '', email: '', subject: '', message: '' }

/** Contact page: static info + simulated async message form with validation. */
export function Contact() {
  usePageTitle('Contact')
  const [form, setForm] = useState<ContactFormState>(initialForm)
  const [errors, setErrors] = useState<Partial<ContactFormState>>({})
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  const update = (field: keyof ContactFormState, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const next: Partial<ContactFormState> = {}
    if (form.name.trim().length < 2) next.name = 'Please enter your name.'
    if (!isValidEmail(form.email)) next.email = 'Please enter a valid email address.'
    if (form.subject.trim().length < 3) next.subject = 'Please add a short subject.'
    if (form.message.trim().length < 10) next.message = 'Tell us a little more (10+ characters).'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (!validate()) return
    setIsSending(true)
    try {
      // Simulated send — swap for a real endpoint later.
      await new Promise((resolve) => setTimeout(resolve, 600))
      setSent(true)
      setForm(initialForm)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Contact us"
        description="Questions about membership, classes or coaching? Drop us a line — we reply within one business day."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1">
          {[
            { title: 'Visit the gym', lines: ['442 Iron Yard Blvd, Springfield', 'Open daily · 5 AM – 11 PM'] },
            { title: 'Give us a call', lines: ['+1 555 010 1100', 'Front desk answered 6 AM – 9 PM'] },
            { title: 'Email us', lines: ['hello@ironforge.fit', 'For everything else, we read it all'] },
          ].map((block) => (
            <Card key={block.title}>
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-white">
                {block.title}
              </h2>
              {block.lines.map((line) => (
                <p key={line} className="mt-2 text-sm text-zinc-400 first-of-type:mt-3">
                  {line}
                </p>
              ))}
            </Card>
          ))}
        </div>

        <Card className="lg:col-span-2" title="Send a message">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="font-display text-xl font-semibold text-volt-300">Message sent!</p>
              <p className="max-w-sm text-sm text-zinc-400">
                Thanks for reaching out — a member of the team will get back to you shortly.
              </p>
              <button type="button" className="btn btn-secondary mt-2" onClick={() => setSent(false)}>
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Your name"
                  name="name"
                  value={form.name}
                  onChange={(event) => update('name', event.target.value)}
                  placeholder="Jane Doe"
                  error={errors.name}
                  autoComplete="name"
                  required
                />
                <FormField
                  label="Email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(event) => update('email', event.target.value)}
                  placeholder="jane@example.com"
                  error={errors.email}
                  autoComplete="email"
                  required
                />
              </div>
              <FormField
                label="Subject"
                name="subject"
                value={form.subject}
                onChange={(event) => update('subject', event.target.value)}
                placeholder="Membership enquiry"
                error={errors.subject}
                required
              />
              <TextareaField
                label="Message"
                name="message"
                value={form.message}
                onChange={(event) => update('message', event.target.value)}
                placeholder="How can we help?"
                error={errors.message}
                required
              />
              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary" disabled={isSending}>
                  {isSending ? <Loader size="sm" label="Sending…" /> : 'Send message'}
                </button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}