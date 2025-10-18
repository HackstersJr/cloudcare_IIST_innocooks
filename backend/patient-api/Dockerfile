FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy shared module and requirements first
COPY shared /app/shared
COPY shared/requirements.txt /app/shared_requirements.txt
COPY patient-api/requirements.txt .

# Install shared dependencies first
RUN pip install --no-cache-dir -r /app/shared_requirements.txt
# Then install API-specific dependencies (if any)
RUN if [ -s requirements.txt ]; then pip install --no-cache-dir -r requirements.txt || true; fi

# Generate Prisma Client
COPY prisma /app/prisma
RUN prisma generate --schema=/app/prisma/schema.prisma

# Copy application code
COPY patient-api/main.py .

# Expose port
EXPOSE 8001

# Run the application
CMD ["python", "main.py"]
