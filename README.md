# Walton County Beach Access

A static public record of how Walton County beach access got this way. Pages: Home, Timeline, Rules, Documents, and Contact.

Open `index.html` in a browser. There is no database and no login.

Visit South Walton tells visitors the current beach rules. This site explains the history, the votes, and the cases. Document files are linked, not stored in this repository.

## Contact form

The contact form posts to `/api/contact`. The Worker sends the message with Resend.

Set these Worker secrets. Do not commit them.

- `RESEND_API_KEY`
- `CONTACT_EMAIL`, the recipient

Optional `CONTACT_FROM` is the verified from address when Resend requires one. If it is unset, the Worker uses Resend's onboarding sender, `onboarding@resend.dev`. That sender can deliver only to the Resend account address until a domain is verified.

If `RESEND_API_KEY` or `CONTACT_EMAIL` is missing, the form says the message could not be sent.
