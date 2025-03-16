import { Plural, Trans, useLingui } from "@lingui/react/macro"
import LocaleSwitcher from "./LocaleSwitcher"

const userName = "Tim";

export default function Inbox() {
  const messages = [{}, {}]
  const messagesCount = messages.length
  const lastLogin = new Date()
  const { i18n, t } = useLingui()
  const markAsRead = () => {
    alert(t`Marked as read.`)
  }

  return (  
    <div>
      <LocaleSwitcher />
      <h1>
        <Trans>Message Inbox</Trans>
      </h1>
      <p>
        {t`Hello ${userName}`}
      </p>
      <p>
        <Trans>
          See all <a href="/unread">unread messages </a>
          {" or "}
          <a onClick={markAsRead}>mark them</a> as read.
        </Trans>
      </p>
      <p>
        <Plural
          value={messagesCount}
          one="There's # message in your inbox."
          other="There are # messages in your inbox."
        />
      </p>
      <footer>
        <Trans>Last login on {i18n.date(lastLogin)}.</Trans>
      </footer>
    </div>
  )
}
