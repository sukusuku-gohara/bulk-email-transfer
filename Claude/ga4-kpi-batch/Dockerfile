FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY *.py .

# Cloud Run は PORT 環境変数でポートを指定
ENV PORT=8080

CMD ["python", "main.py", "--serve"]
