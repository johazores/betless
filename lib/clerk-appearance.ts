/**
 * Single source of truth for Clerk theming. Applied on the ClerkProvider so
 * every Clerk surface (sign-in, sign-up, modals, user button menu, profile)
 * inherits the Betless visual language.
 *
 * `variables` mirror the design tokens in app/globals.css; `elements` map
 * Tailwind utility classes onto Clerk's named parts. Update tokens there and
 * here together.
 */
export const clerkAppearance = {
  layout: {
    socialButtonsVariant: 'blockButton',
    // Hides the orange "Development mode" ribbon on dev instances so demos
    // look like production. Has no effect on production instances.
    unsafe_disableDevelopmentModeWarnings: true,
  },
  variables: {
    colorPrimary: 'rgb(15 23 42)', // ink — matches the app's primary buttons
    colorText: 'rgb(15 23 42)',
    colorTextSecondary: 'rgb(100 116 139)',
    colorBackground: 'rgb(255 255 255)',
    colorInputBackground: 'rgb(255 255 255)',
    colorInputText: 'rgb(2 6 23)',
    colorDanger: 'rgb(220 38 38)',
    colorSuccess: 'rgb(5 150 105)',
    colorWarning: 'rgb(217 119 6)',
    colorNeutral: 'rgb(15 23 42)',
    borderRadius: '0.75rem',
    fontFamily: 'var(--font-sans), ui-sans-serif, system-ui, sans-serif',
    fontSize: '0.9375rem',
  },
  elements: {
    cardBox: 'w-full rounded-2xl border border-line bg-surface shadow-card',
    card: 'gap-6',
    headerTitle: 'text-2xl font-black tracking-tight text-ink',
    headerSubtitle: 'text-sm leading-6 text-ink-muted',
    formButtonPrimary:
      'min-h-11 rounded-full bg-ink text-sm font-semibold text-white shadow-sm transition-all hover:bg-ink/90 active:scale-[0.98]',
    formFieldLabel: 'text-sm font-semibold text-ink',
    formFieldInput:
      'rounded-xl border-line-strong text-base font-medium focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
    formFieldAction: 'text-sm font-bold text-brand-800 hover:text-brand-900',
    formFieldHintText: 'text-xs font-medium text-ink-muted',
    otpCodeFieldInput: 'rounded-xl border-line-strong text-xl font-black text-ink',
    socialButtonsBlockButton:
      'min-h-11 rounded-xl border-line-strong font-semibold text-ink transition hover:bg-surface-muted',
    dividerLine: 'bg-line',
    dividerText: 'text-xs font-semibold uppercase tracking-wide text-ink-muted',
    footer: 'bg-surface-muted [&>*]:bg-transparent',
    footerActionText: 'text-sm font-semibold text-ink-muted',
    footerActionLink: 'font-black text-brand-800 hover:text-brand-900',
    identityPreview: 'rounded-xl border-line bg-surface-muted',
    identityPreviewEditButton: 'text-brand-800 hover:text-brand-900',
    alternativeMethodsBlockButton: 'rounded-xl border-line-strong font-semibold text-ink hover:bg-surface-muted',
    userButtonAvatarBox: 'h-9 w-9 ring-2 ring-line',
    userButtonPopoverCard: 'rounded-2xl border border-line shadow-elevated',
    userButtonPopoverActionButton: 'font-semibold text-ink hover:bg-surface-muted',
    userButtonPopoverFooter: 'hidden',
  },
} as const;
