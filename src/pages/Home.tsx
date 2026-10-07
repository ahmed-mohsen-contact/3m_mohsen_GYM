import { Link } from 'react-router-dom'
import { useGym } from '../hooks/useGym'
import { useNow } from '../hooks/useNow'
import { usePageTitle } from '../hooks/usePageTitle'
import { useReveal } from '../hooks/useReveal'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { Loader } from '../components/Loader'
import { formatCurrency, initials } from '../utils/format'

const services = [
  {
    title: 'Strength Training',
    description: 'Barbell, dumbbell and machine work coached to build serious, lasting strength.',
    accent: 'text-brand-400',
  },
  {
    title: 'HIIT & Conditioning',
    description: 'High-octane circuits on the turf that push your engine and torch calories.',
    accent: 'text-volt-300',
  },
  {
    title: 'Boxing & Combat',
    description: 'Footwork, pads and heavy bags — discipline meets conditioning in the ring room.',
    accent: 'text-sky-400',
  },
  {
    title: 'Yoga & Mobility',
    description: 'Restore range of motion, balance the nervous system and train with better posture.',
    accent: 'text-emerald-400',
  },
]

const testimonials = [
  {
    quote: "I've trained in a dozen gyms — none of them felt like a team. IronForge is different. I'm down 18 lbs and up a whole community.",
    name: 'Danielle R.',
    role: 'Member since 2025',
  },
  {
    quote: 'The coaches actually coach. Every session is programmed, tracked and pushed. My strength numbers have never moved this fast.',
    name: 'Marcus T.',
    role: 'Elite member',
  },
  {
    quote: 'As a commuter with a crazy schedule, the app-first booking and early classes keep me consistent. The team makes it effortless.',
    name: 'Priya S.',
    role: 'Pro member',
  },
]

/** Public landing page: hero, stats, services, pricing teaser, trainers, testimonials. */
export function Home() {
  usePageTitle('Home')
  const { plans, trainers, members, classes, isLoading } = useGym()
  const now = useNow()

  const { ref: heroRevealRef } = useReveal<HTMLDivElement>({ delayMs: 80 })
  const { ref: servicesRevealRef } = useReveal<HTMLDivElement>({ delayMs: 40 })
  const { ref: pricingRevealRef } = useReveal<HTMLDivElement>({ delayMs: 40 })
  const { ref: trainersRevealRef } = useReveal<HTMLDivElement>({ delayMs: 40 })
  const { ref: testimonialsRevealRef } = useReveal<HTMLDivElement>({ delayMs: 40 })

  const upcomingClassCount = classes.filter(
    (cls) => cls.status === 'scheduled' && new Date(cls.startsAt).getTime() > now,
  ).length

  if (isLoading) {
    return <Loader fullScreen label="Firing up the gym…" />
  }

  return (
    <div className="overflow-x-clip">
      {/* ---------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute top-40 -right-24 h-96 w-96 rounded-full bg-volt-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/0 via-zinc-950/40 to-zinc-950" />
        </div>

        <div ref={heroRevealRef} className="reveal relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <Badge tone="volt" className="mb-6">
            Springfield&apos;s #1 strength &amp; conditioning gym
          </Badge>
          <h1 className="max-w-3xl font-display text-5xl leading-[1.02] font-semibold uppercase tracking-tight text-white sm:text-7xl">
            Forge <span className="text-brand-500">strength</span>. Build
            <span className="text-volt-300"> discipline</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-zinc-400">
            Everything you need to get stronger — coaching, classes, programming and a
            community that shows up. No excuses, no fluff.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn btn-primary px-6 py-3 text-base">
              Start 7-day trial
            </Link>
            <Link to="/classes" className="btn btn-secondary px-6 py-3 text-base">
              View class schedule
            </Link>
          </div>

          <dl className="mt-16 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { label: 'Active members', value: members.length, suffix: '+' },
              { label: 'Weekly classes', value: upcomingClassCount, suffix: '' },
              { label: 'Expert trainers', value: trainers.length, suffix: '' },
              { label: 'Open daily', value: '5am', suffix: '–11pm' },
            ].map((stat) => (
              <div key={stat.label} className="border-l-2 border-brand-500/60 pl-3">
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {stat.label}
                </dt>
                <dd className="text-3xl font-semibold text-white">
                  {stat.value}
                  <span className="text-brand-400">{stat.suffix}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------------------------------------- Services */}
      <section ref={servicesRevealRef} className="reveal mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-500">Train your way</p>
          <h2 className="font-display text-3xl font-semibold uppercase tracking-wide text-white sm:text-4xl">
            Programs for every goal
          </h2>
          <p className="mt-2 text-zinc-400">
            Our teams build progressive programs around whatever you want to achieve — size,
            strength, endurance or just feeling better in your body.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Card key={service.title} className="transition-colors hover:border-brand-500/40">
              <h3 className={`font-display text-xl font-semibold uppercase ${service.accent}`}>
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{service.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------- Pricing teaser */}
      <section ref={pricingRevealRef} className="reveal border-y border-zinc-900 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-volt-300">Membership</p>
              <h2 className="font-display text-3xl font-semibold uppercase tracking-wide text-white sm:text-4xl">
                Plans that flex with you
              </h2>
            </div>
            <Link to="/pricing" className="btn btn-ghost">
              Compare all plans
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {plans.slice(0, 3).map((plan) => (
              <Card
                key={plan.id}
                className={plan.price === 99 ? 'border-brand-500/50 bg-zinc-900' : undefined}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold uppercase text-white">{plan.name}</h3>
                  {plan.price === 99 && <Badge tone="volt">Most popular</Badge>}
                </div>
                <p className="mt-3">
                  <span className="font-display text-4xl font-semibold text-white">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-sm text-zinc-500"> / {plan.interval}</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-0.5 text-brand-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------- Trainers */}
      <section ref={trainersRevealRef} className="reveal mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-500">The coaches</p>
          <h2 className="font-display text-3xl font-semibold uppercase tracking-wide text-white sm:text-4xl">
            Trainers who push you
          </h2>
        </div>

        {trainers.length === 0 ? (
          <Loader label="Loading trainers…" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trainers.map((trainer) => (
              <Card key={trainer.id} className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-bold text-white">
                  {initials(trainer.firstName, trainer.lastName)}
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">
                  {trainer.firstName} {trainer.lastName}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">Certified strength coach</p>
                <p className="mt-2 text-sm text-zinc-400">{trainer.email}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------- Testimonials */}
      <section ref={testimonialsRevealRef} className="reveal border-t border-zinc-900 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-volt-300">Member stories</p>
          <h2 className="mb-10 font-display text-3xl font-semibold uppercase tracking-wide text-white sm:text-4xl">
            Real results, real people
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name}>
                <p className="text-sm leading-relaxed text-zinc-300">“{testimonial.quote}”</p>
                <footer className="mt-4 border-t border-zinc-800 pt-3">
                  <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                  <p className="text-xs text-zinc-500">{testimonial.role}</p>
                </footer>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
