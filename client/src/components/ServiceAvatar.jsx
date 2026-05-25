import React, { useState } from 'react'

// ─── Comprehensive Service → Domain Map for Clearbit Logos ──────────────────
const DOMAIN_MAP = {
  // Streaming & Entertainment
  netflix: 'netflix.com',
  hulu: 'hulu.com',
  'disney+': 'disneyplus.com',
  'disney plus': 'disneyplus.com',
  'prime video': 'amazon.com',
  'amazon prime': 'amazon.com',
  'hbo max': 'hbomax.com',
  hbo: 'hbomax.com',
  'paramount+': 'paramountplus.com',
  paramount: 'paramountplus.com',
  peacock: 'peacocktv.com',
  'apple tv': 'apple.com',
  crunchyroll: 'crunchyroll.com',
  twitch: 'twitch.tv',

  // Music
  spotify: 'spotify.com',
  'apple music': 'apple.com',
  'youtube music': 'youtube.com',
  tidal: 'tidal.com',
  deezer: 'deezer.com',
  soundcloud: 'soundcloud.com',
  pandora: 'pandora.com',

  // Productivity & Work
  notion: 'notion.so',
  slack: 'slack.com',
  zoom: 'zoom.us',
  asana: 'asana.com',
  trello: 'trello.com',
  monday: 'monday.com',
  clickup: 'clickup.com',
  todoist: 'todoist.com',
  evernote: 'evernote.com',
  airtable: 'airtable.com',
  miro: 'miro.com',
  'google workspace': 'google.com',
  grammarly: 'grammarly.com',
  '1password': '1password.com',
  lastpass: 'lastpass.com',
  bitwarden: 'bitwarden.com',
  zapier: 'zapier.com',

  // Design
  figma: 'figma.com',
  adobe: 'adobe.com',
  canva: 'canva.com',
  sketch: 'sketch.com',
  invision: 'invisionapp.com',
  framer: 'framer.com',

  // Developer
  github: 'github.com',
  gitlab: 'gitlab.com',
  bitbucket: 'bitbucket.org',
  vercel: 'vercel.com',
  netlify: 'netlify.com',
  heroku: 'heroku.com',
  'digital ocean': 'digitalocean.com',
  digitalocean: 'digitalocean.com',
  cloudflare: 'cloudflare.com',
  railway: 'railway.app',
  supabase: 'supabase.com',
  planetscale: 'planetscale.com',
  'jetbrains': 'jetbrains.com',
  datadog: 'datadoghq.com',
  sentry: 'sentry.io',

  // AI & ML
  chatgpt: 'openai.com',
  openai: 'openai.com',
  claude: 'anthropic.com',
  anthropic: 'anthropic.com',
  midjourney: 'midjourney.com',
  jasper: 'jasper.ai',
  'github copilot': 'github.com',
  copilot: 'github.com',
  perplexity: 'perplexity.ai',
  cursor: 'cursor.com',

  // Cloud Storage
  icloud: 'apple.com',
  'google drive': 'google.com',
  'google one': 'google.com',
  dropbox: 'dropbox.com',
  onedrive: 'microsoft.com',
  'box': 'box.com',
  mega: 'mega.nz',
  pcloud: 'pcloud.com',

  // Social & Communication
  linkedin: 'linkedin.com',
  discord: 'discord.com',
  telegram: 'telegram.org',
  whatsapp: 'whatsapp.com',
  twitter: 'x.com',
  x: 'x.com',
  reddit: 'reddit.com',
  medium: 'medium.com',
  substack: 'substack.com',

  // Big Tech
  youtube: 'youtube.com',
  'youtube premium': 'youtube.com',
  google: 'google.com',
  apple: 'apple.com',
  amazon: 'amazon.com',
  aws: 'aws.amazon.com',
  microsoft: 'microsoft.com',
  office: 'microsoft.com',
  'microsoft 365': 'microsoft.com',

  // VPN & Security
  nordvpn: 'nordvpn.com',
  expressvpn: 'expressvpn.com',
  surfshark: 'surfshark.com',
  protonvpn: 'protonvpn.com',
  proton: 'proton.me',

  // Fitness & Health
  peloton: 'onepeloton.com',
  strava: 'strava.com',
  fitbit: 'fitbit.com',
  headspace: 'headspace.com',
  calm: 'calm.com',
  myfitnesspal: 'myfitnesspal.com',

  // Education
  coursera: 'coursera.org',
  udemy: 'udemy.com',
  skillshare: 'skillshare.com',
  masterclass: 'masterclass.com',
  duolingo: 'duolingo.com',
  brilliant: 'brilliant.org',
  'linkedin learning': 'linkedin.com',

  // Finance
  mint: 'mint.com',
  ynab: 'ynab.com',
  robinhood: 'robinhood.com',
  coinbase: 'coinbase.com',
  binance: 'binance.com',
  stripe: 'stripe.com',
  paypal: 'paypal.com',
  wise: 'wise.com',

  // News & Reading
  'new york times': 'nytimes.com',
  nyt: 'nytimes.com',
  'wall street journal': 'wsj.com',
  wsj: 'wsj.com',
  economist: 'economist.com',
  'washington post': 'washingtonpost.com',
  bloomberg: 'bloomberg.com',
  kindle: 'amazon.com',
  audible: 'audible.com',

  // Email & Marketing
  mailchimp: 'mailchimp.com',
  sendgrid: 'sendgrid.com',
  hubspot: 'hubspot.com',
  intercom: 'intercom.com',
  zendesk: 'zendesk.com',
  freshdesk: 'freshdesk.com',

  // CRM & Business
  salesforce: 'salesforce.com',
  shopify: 'shopify.com',
  squarespace: 'squarespace.com',
  wix: 'wix.com',
  wordpress: 'wordpress.com',
  webflow: 'webflow.com',

  // Gaming
  'xbox game pass': 'xbox.com',
  xbox: 'xbox.com',
  'playstation plus': 'playstation.com',
  playstation: 'playstation.com',
  'nintendo switch': 'nintendo.com',
  nintendo: 'nintendo.com',
  'ea play': 'ea.com',
  steam: 'store.steampowered.com',

  // Domain & Hosting
  godaddy: 'godaddy.com',
  namecheap: 'namecheap.com',
  bluehost: 'bluehost.com',
  hostinger: 'hostinger.com',
  siteground: 'siteground.com',
}

// Category → color accent for fallback avatars
const CATEGORY_COLORS = {
  Entertainment: { bg: 'rgba(139, 92, 246, 0.12)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.25)' },
  Music: { bg: 'rgba(236, 72, 153, 0.12)', text: '#ec4899', border: 'rgba(236, 72, 153, 0.25)' },
  Productivity: { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.25)' },
  'Cloud Storage': { bg: 'rgba(6, 182, 212, 0.12)', text: '#06b6d4', border: 'rgba(6, 182, 212, 0.25)' },
  Education: { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.25)' },
  Fitness: { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', border: 'rgba(16, 185, 129, 0.25)' },
  Design: { bg: 'rgba(251, 146, 60, 0.12)', text: '#fb923c', border: 'rgba(251, 146, 60, 0.25)' },
  Developer: { bg: 'rgba(148, 163, 184, 0.12)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.25)' },
  'AI & ML': { bg: 'rgba(168, 85, 247, 0.12)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.25)' },
  default: { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.25)' },
}

/**
 * Returns the Clearbit logo URL for a known service, or null.
 */
export function getLogoUrl(name) {
  if (!name) return null
  const n = name.toLowerCase().trim()
  const key = Object.keys(DOMAIN_MAP).find((k) => n.includes(k))
  return key ? `https://logo.clearbit.com/${DOMAIN_MAP[key]}` : null
}

/**
 * Get the category-based color scheme for fallback avatars.
 */
export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.default
}

/**
 * ServiceAvatar component — shows a Clearbit logo or a styled fallback initial.
 * @param {string} name - Service name
 * @param {string} [category] - Category for fallback color
 * @param {'sm'|'md'|'lg'} [size='md'] - Avatar size
 */
export default function ServiceAvatar({ name, category, size = 'md' }) {
  const logoUrl = getLogoUrl(name)
  const [imgFailed, setImgFailed] = useState(false)
  const colors = getCategoryColor(category)

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-[11px]',
    md: 'w-10 h-10 rounded-xl text-sm',
    lg: 'w-12 h-12 rounded-2xl text-base',
  }
  const imgSizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
  }

  if (logoUrl && !imgFailed) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${imgSizeClasses[size]} object-cover bg-slate-800/80 border border-white/[0.06] flex-shrink-0 shadow-sm`}
        onError={() => setImgFailed(true)}
        loading="lazy"
      />
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center font-bold uppercase select-none flex-shrink-0 shadow-sm`}
      style={{
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {name?.[0] || '?'}
    </div>
  )
}
