import { env } from '../env'
import { GitHubStarButton } from './GitHubStarButton'
import { Logo } from './Logo'

export function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <div className="header__brand">
          <Logo name={env.appName} />
          {!env.isProduction && <span className="env-badge">{env.appEnv}</span>}
        </div>
        <div className="header__actions">
          <GitHubStarButton repo={env.githubRepo} />
        </div>
      </div>
    </header>
  )
}
