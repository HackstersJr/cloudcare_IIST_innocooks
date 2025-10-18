FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y gcc postgresql-client && rm -rf /var/lib/apt/lists/*
COPY shared /app/shared
COPY shared/requirements.txt /app/shared_requirements.txt
COPY wearables-api/requirements.txt .
RUN pip install --no-cache-dir -r /app/shared_requirements.txt
RUN if [ -s requirements.txt ]; then pip install --no-cache-dir -r requirements.txt || true; fi
COPY prisma /app/prisma
RUN prisma generate --schema=/app/prisma/schema.prisma
COPY wearables-api/main.py .
EXPOSE 8005
CMD ["python", "main.py"]
