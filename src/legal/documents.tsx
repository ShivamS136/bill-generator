import type { ReactNode } from 'react'
import { linkClass } from '../components/ui'
import { env } from '../env'
import { ClearDataButton } from './ClearDataButton'

export interface LegalSection {
  heading: string
  content: ReactNode
}

export interface LegalDoc {
  id: 'terms' | 'privacy' | 'disclaimer'
  title: string
  summary: string
  sections: LegalSection[]
}

export const LAST_UPDATED = '8 October 2026'

const issuesUrl = `https://github.com/${env.githubRepo}/issues`

function Paragraph({ children }: { children: ReactNode }) {
  return <p className="leading-relaxed">{children}</p>
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="grid list-disc gap-2 pl-5 leading-relaxed marker:text-ink-muted">
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static content
        <li key={index}>{item}</li>
      ))}
    </ul>
  )
}

function DocLink({ to, children }: { to: LegalDoc['id']; children: ReactNode }) {
  return (
    <a className={linkClass} href={`#/${to}`}>
      {children}
    </a>
  )
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className={linkClass} href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

const contact: LegalSection = {
  heading: 'Contact',
  content: (
    <Paragraph>
      Questions can be raised as an issue on the project's{' '}
      <ExternalLink href={issuesUrl}>GitHub repository</ExternalLink>.
    </Paragraph>
  ),
}

const terms: LegalDoc = {
  id: 'terms',
  title: 'Terms of Use',
  summary:
    'Bill Generator is a free tool for making records of genuine expenses and for mock or sample documents. You alone decide how you use what you create, and you alone are responsible for it.',
  sections: [
    {
      heading: 'Agreement to these terms',
      content: (
        <Paragraph>
          By opening or using Bill Generator (the “Service”), you agree to these Terms of Use, the{' '}
          <DocLink to="privacy">Privacy Policy</DocLink> and the{' '}
          <DocLink to="disclaimer">Disclaimer</DocLink>. If you do not agree, do not use the
          Service.
        </Paragraph>
      ),
    },
    {
      heading: 'Eligibility',
      content: (
        <Paragraph>
          You must be at least 18 years old and able to enter into a binding agreement to use the
          Service.
        </Paragraph>
      ),
    },
    {
      heading: 'What the Service does',
      content: (
        <Paragraph>
          The Service lets you fill in a form and download the result as a PDF. Everything happens
          in your browser. The Service does not check, verify or approve anything you enter, and the
          documents it produces have no official status of their own.
        </Paragraph>
      ),
    },
    {
      heading: 'Permitted use',
      content: (
        <>
          <Paragraph>You may use the Service only to:</Paragraph>
          <Bullets
            items={[
              'prepare records of payments and expenses that genuinely took place, for example to support an official reimbursement claim where your employer accepts self-prepared receipts;',
              'create mock, sample, demo or test documents that are not presented as real records;',
              'learn about or experiment with document templates.',
            ]}
          />
        </>
      ),
    },
    {
      heading: 'Prohibited use',
      content: (
        <>
          <Paragraph>You must not use the Service to:</Paragraph>
          <Bullets
            items={[
              'create documents for expenses or payments that did not happen, or inflate the amount of ones that did;',
              'deceive or defraud an employer, tax authority, insurer, bank, court or anyone else;',
              "add another person's signature or acknowledgement without their consent;",
              'impersonate a person, business or government body, or use their names, logos or marks without permission;',
              'break any law that applies to you, including tax, stamp duty, forgery and fraud laws.',
            ]}
          />
        </>
      ),
    },
    {
      heading: 'Your responsibility',
      content: (
        <Paragraph>
          You are solely responsible for every document you create with the Service and for how you
          use it. That includes the accuracy of the details you enter, having the right to use any
          signature you add, and following your employer's rules and the law. The maintainer of the
          Service has no control over, and accepts no responsibility for, what you do with the
          Service or its output.
        </Paragraph>
      ),
    },
    {
      heading: 'No warranty',
      content: (
        <Paragraph>
          The Service is provided free of charge, “as is” and “as available”, without warranties of
          any kind, express or implied, including fitness for a particular purpose, accuracy or
          acceptance by any third party. There is no promise that the Service will be available or
          error-free, or that any document will be accepted.
        </Paragraph>
      ),
    },
    {
      heading: 'Limitation of liability',
      content: (
        <Paragraph>
          To the fullest extent permitted by law, the maintainer of the Service is not liable for
          any loss, damage, claim, penalty or legal consequence, whether direct, indirect,
          incidental or consequential, arising from your use of, or inability to use, the Service or
          any document produced with it.
        </Paragraph>
      ),
    },
    {
      heading: 'Indemnity',
      content: (
        <Paragraph>
          You agree to indemnify and hold harmless the maintainer of the Service against any claim,
          loss or expense, including legal fees, arising from your use or misuse of the Service or
          your breach of these terms.
        </Paragraph>
      ),
    },
    {
      heading: 'Changes',
      content: (
        <Paragraph>
          These terms and the Service may change at any time. The date at the top shows the latest
          revision. If you keep using the Service after a change, you accept the revised terms.
        </Paragraph>
      ),
    },
    {
      heading: 'Governing law',
      content: <Paragraph>These terms are governed by the laws of India.</Paragraph>,
    },
    {
      heading: 'Severability',
      content: (
        <Paragraph>
          If any part of these terms is found unenforceable, the rest remains in full effect.
        </Paragraph>
      ),
    },
    contact,
  ],
}

const privacy: LegalDoc = {
  id: 'privacy',
  title: 'Privacy Policy',
  summary:
    'Bill Generator does not collect, store or share your personal information. What you type stays in your browser, and no cookies are used.',
  sections: [
    {
      heading: 'Information you enter',
      content: (
        <Paragraph>
          Names, amounts, dates, vehicle numbers, signatures and anything else you type into a form
          are processed only in your browser. They are never sent to the maintainer or to any
          server, because the Service has no server of its own.
        </Paragraph>
      ),
    },
    {
      heading: 'Data saved in your browser',
      content: (
        <>
          <Paragraph>
            To save you retyping, the Service keeps your latest form entries and signatures in your
            browser's local storage on this device. They are not sent anywhere, but anyone using
            this browser profile can see them, so clear them on shared devices. They stay until you
            clear them below or clear this site's data in your browser settings. Because the
            maintainer never receives this data, there is nothing held elsewhere to access, correct
            or delete.
          </Paragraph>
          <div>
            <ClearDataButton />
          </div>
        </>
      ),
    },
    {
      heading: 'PDF generation',
      content: (
        <Paragraph>
          PDFs are created on your device and saved straight to your downloads. No copy is uploaded
          or kept anywhere else.
        </Paragraph>
      ),
    },
    {
      heading: 'Cookies and tracking',
      content: (
        <Paragraph>
          The Service does not set cookies and does not use analytics, advertising or tracking
          tools, so there is no cookie banner. The browser storage described above is used only to
          keep your own entries between visits and is never sent to the maintainer.
        </Paragraph>
      ),
    },
    {
      heading: 'Third-party services',
      content: (
        <Bullets
          items={[
            <>
              <strong>Hosting.</strong> The Service is hosted on GitHub Pages. GitHub may log
              technical details such as your IP address when your browser loads the site. See{' '}
              <ExternalLink href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
                GitHub's Privacy Statement
              </ExternalLink>
              .
            </>,
            <>
              <strong>GitHub star button.</strong> The button in the footer fetches the project's
              public star count from GitHub, so your browser connects to GitHub to show it.
            </>,
            <>
              <strong>Signature from a URL.</strong> If you load a signature image from a web
              address, your browser fetches it directly from that address, and the site hosting it
              can see the request.
            </>,
            <>
              <strong>Fonts.</strong> All fonts are bundled with the Service, so no font service is
              contacted.
            </>,
          ]}
        />
      ),
    },
    {
      heading: 'Changes to this policy',
      content: <Paragraph>If this policy changes, the date at the top will be updated.</Paragraph>,
    },
    contact,
  ],
}

const disclaimer: LegalDoc = {
  id: 'disclaimer',
  title: 'Disclaimer',
  summary:
    'This website is for genuine official records and mock purposes only. How you use it is entirely up to you, and you alone are responsible for that use.',
  sections: [
    {
      heading: 'Purpose of the Service',
      content: (
        <Paragraph>
          Bill Generator helps people format records of genuine expenses, such as a receipt for a
          salary actually paid to a driver, and produce mock or sample documents for demos, testing
          and learning. It is not intended for creating false or misleading documents.
        </Paragraph>
      ),
    },
    {
      heading: 'You are responsible',
      content: (
        <Paragraph>
          Whether and how you use any document created here is your decision alone. The maintainer
          is not responsible for any use or misuse of the Service and accepts no liability for any
          consequence of it, including rejected claims, penalties, disciplinary action or legal
          proceedings. See the <DocLink to="terms">Terms of Use</DocLink> for details.
        </Paragraph>
      ),
    },
    {
      heading: 'Not professional advice',
      content: (
        <Paragraph>
          Nothing on this website is legal, tax, accounting or financial advice. Reimbursement and
          tax rules differ between employers and change over time, so check with your employer or a
          qualified professional before relying on any document.
        </Paragraph>
      ),
    },
    {
      heading: 'Templates and accuracy',
      content: (
        <Paragraph>
          Templates, wording and calculations are provided for convenience and may contain errors or
          omissions. Review every document before you use it. A template's appearance does not mean
          it meets any employer's or authority's requirements.
        </Paragraph>
      ),
    },
    {
      heading: 'Stamps and signatures',
      content: (
        <Paragraph>
          Images such as revenue stamps and generated signatures are illustrations. A printed image
          of a stamp is not a real stamp, and a signature only has meaning when it is added by, or
          with the consent of, the person it represents.
        </Paragraph>
      ),
    },
    {
      heading: 'No affiliation',
      content: (
        <Paragraph>
          The Service is an independent project. It is not affiliated with, endorsed by or connected
          to any employer, government body, tax authority or company whose name may appear in a
          document you create.
        </Paragraph>
      ),
    },
    {
      heading: 'External links',
      content: (
        <Paragraph>
          Links to other websites are provided for convenience. The maintainer is not responsible
          for their content or practices.
        </Paragraph>
      ),
    },
    contact,
  ],
}

export const legalDocs: LegalDoc[] = [terms, privacy, disclaimer]

export function findLegalDoc(id: string): LegalDoc | undefined {
  return legalDocs.find((doc) => doc.id === id)
}
