# 🧪 Pytest Guide for FastAPI Auth Project

## 📂 Location
All test files live under:
```
app/tests/
```

## 🚀 Running Tests
Activate your virtual environment and run:

```bash
pytest -v
```

- `-v` → verbose output (shows each test name and result)  
- `--disable-warnings` → optional, hides warnings for cleaner logs  
- `--maxfail=1` → stop on first failure (useful for debugging)

Example:
```bash
pytest -v --disable-warnings
```

## ⚙️ Environment Configuration
Tests use the same settings as the app via `app/settings.py`.

**Required variables (in `.env`):**
```env
SERVER_PORT=8000
WEBAPP_DOMAIN=localhost
ENV_TYPE=dev
JWT_SECRET_KEY=<your-secret>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=180
REFRESH_TOKEN_EXPIRE_MINUTES=10080
```

Pytest automatically reads them through the `Settings` model,  
so no extra `dotenv` setup is needed.

## 🧠 Key Test Files

| File | Description |
|------|--------------|
| `test_auth_endpoints.py` | End-to-end tests for `/auth` and `/users/me` endpoints |
| | ✅ Register user |
| | ✅ Login and receive tokens |
| | ✅ Access `/me` with valid token |
| | ✅ Refresh expired token automatically |

## 🔍 Useful Commands
Run a single test:
```bash
pytest app/tests/test_auth_endpoints.py::test_auto_refresh_on_expired_token -v
```

Generate coverage report:
```bash
pytest --cov=app --cov-report=term-missing
```

Run tests with HTML report:
```bash
pytest --html=report.html --self-contained-html
```

## 🧰 Tips
- Always run tests with your local DB up (Docker or Prisma engine running).  
- Use `pytest.ini` to set common options (async mode, path config).  
- Keep each test isolated — pytest handles event loops and DB sessions automatically.


**Author:** API Team — br-general-python
**Version:** v1.1.0
**Last Updated:** 2025-10-05