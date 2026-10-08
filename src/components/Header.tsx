import { env } from '../env'
import { cx } from '../lib/cx'
import { GitHubLink } from './GitHubLink'
import { Logo } from './Logo'
import { container } from './ui'

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-line border-b bg-surface">
      <div className={cx(container, 'flex h-16 items-center justify-between gap-4')}>
        <div className="flex items-center gap-2.5">
          <Logo name={env.appName} />
          {!env.isProduction && (
            <span className="hidden rounded-full bg-orange-50 px-2 py-0.5 font-semibold text-orange-800 text-xs uppercase tracking-wide sm:inline">
              {env.appEnv}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <GitHubLink repo={env.githubRepo} />
        </div>
      </div>
    </header>
  )
}
