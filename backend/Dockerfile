# ==============================================================================
# FetoAI Backend - Production Dockerfile
# Optimized for Free-Tier Deployment on Hugging Face Spaces (Docker SDK),
# Render Free Web Services, Railway, Fly.io, and Google Cloud Run.
# ==============================================================================

FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable immediate stdout flushing
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    PORT=7860 \
    HOST=0.0.0.0

# Install required system packages (build tools, OpenMP support for sentence-transformers/torch)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    g++ \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Set up non-root user for Hugging Face Spaces compatibility (UID 1000)
RUN useradd -m -u 1000 user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR /home/user/app

# Install Python dependencies first for optimal Docker layer caching
COPY --chown=user:user requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application source code
COPY --chown=user:user . .

# Set working directory permissions
RUN chown -R user:user /home/user/app

# Switch to non-root user
USER user

# Expose standard ports (7860 for Hugging Face Spaces, 8000 for standard Render/FastAPI)
EXPOSE 7860
EXPOSE 8000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://127.0.0.1:${PORT:-7860}/health || exit 1

# Launch FastAPI using Uvicorn with dynamic PORT environment variable
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
