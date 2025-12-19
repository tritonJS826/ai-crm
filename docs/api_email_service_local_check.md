## MailHog (Local Email Testing)

We use [MailHog](https://github.com/mailhog/MailHog) to test emails locally.

Used ports:
SMTP: 1025 for sending emails

Web UI: 8025 for viewing emails in UI

http://localhost:8000/br-general/email/send

### 🖥️ Check the MailHog web interface:

http://localhost:8025

### To test sending an email, you can use the following `curl` command:

```bash
curl -X POST http://localhost:8000/br-general/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Welcome to Brain100!",
    "template": "email/welcome.html",
    "params": {
      "name": "DemoUser"
    }
  }'
```

### 📑 Demo for Swagger UI:

```bash
{
  "to": "user@example.com",
  "subject": "Welcome to Brain100!",
  "template": "email/welcome.html",
  "params": 
    { "name": "DemoUser" }
}

```

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-01
**Author:** br-general-python API Team