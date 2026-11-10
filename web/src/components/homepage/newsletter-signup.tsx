'use client'

import { useId, useRef, useState } from 'react'
import { clean } from './shared'

export type NewsletterSignupBlock = { heading?: string | null; intro?: string | null; emailHint?: string | null; roles?: string[] | null; buttonLabel?: string | null }

const PERSONAL = /@(gmail|googlemail|hotmail|outlook|live|yahoo|icloud|me|aol|btinternet)\./i

/** Demo sign-up: checks for a work email and a role, then confirms. Nothing is sent. */
export function NewsletterSignup({ block }: { block: NewsletterSignupBlock }) {
  const uid = useId()
  const email = useRef<HTMLInputElement>(null)
  const role = useRef<HTMLSelectElement>(null)
  const [errs, setErrs] = useState({ email: false, role: false })
  const [done, setDone] = useState('')

  return (
    <div className="hp-section hp-signup">
      <div className="wrapper hp-signup__inner">
        <div>
          <h2 className="hp-title hp-title--light">{block.heading}</h2>
          {block.intro && <p className="hp-lede hp-lede--light">{block.intro}</p>}
        </div>
        <form
          className="hp-signup__form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            const v = email.current?.value.trim() ?? ''
            const okE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) && !PERSONAL.test(v)
            const okR = !!role.current?.value
            setErrs({ email: !okE, role: !okR })
            if (!okE) return email.current?.focus()
            if (!okR) return role.current?.focus()
            setDone(`Thanks. Check ${v} for a link to confirm your subscription. (Demo: nothing has been sent.)`)
          }}
        >
          <fieldset disabled={!!done} style={{ border: 0, padding: 0, margin: 0, display: 'contents' }}>
            <div className="hp-field">
              <label htmlFor={`${uid}-email`}>Work email address</label>
              <input
                ref={email}
                id={`${uid}-email`}
                type="email"
                autoComplete="email"
                required
                aria-invalid={errs.email}
                aria-describedby={`${uid}-hint ${uid}-eerr`}
              />
              {block.emailHint && (
                <span className="hp-field__hint" id={`${uid}-hint`}>
                  {block.emailHint}
                </span>
              )}
              <span className="hp-field__err" id={`${uid}-eerr`} hidden={!errs.email}>
                Enter a work email address, like name@school.sch.uk
              </span>
            </div>
            <div className="hp-field">
              <label htmlFor={`${uid}-role`}>I am</label>
              <select ref={role} id={`${uid}-role`} required aria-invalid={errs.role} aria-describedby={`${uid}-rerr`} defaultValue="">
                <option value="">Choose your role</option>
                {(block.roles ?? []).map((r) => (
                  <option key={r}>{clean(r)}</option>
                ))}
              </select>
              <span className="hp-field__err" id={`${uid}-rerr`} hidden={!errs.role}>
                Choose your role
              </span>
            </div>
            <button type="submit" className="hp-btn hp-btn--primary">
              {block.buttonLabel || 'Sign up'}
            </button>
          </fieldset>
          <p className="hp-signup__done" role="status" hidden={!done}>
            {done}
          </p>
        </form>
      </div>
    </div>
  )
}
