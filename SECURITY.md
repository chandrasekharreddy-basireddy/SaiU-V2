# Security

## Reporting a vulnerability

Report security issues privately via [GitHub Security Advisories](https://github.com/chandrasekharreddy-basireddy/SaiU-V2/security/advisories/new) rather than publishing exploit details in a public issue.

## Guidelines

- Never put OpenAI, Anthropic, Gemini, database, or n8n credentials in browser code.
- The optional `saiu_ai_endpoint` setting is a public endpoint address, not a secret.
- Use a server-side gateway for authenticated AI requests and rate limiting.
- Validate and bound timetable payloads before forwarding them to an AI service.
- Keep analytics privacy-preserving and avoid collecting student schedule data unless necessary.
- Use HTTPS in production.
- Treat imported timetable data as untrusted input and escape it before rendering.
- Report security issues privately to the repository owner rather than publishing exploit details in an issue.
