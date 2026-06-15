"""
Optimiza las imágenes EXISTENTES: descarga cada JPG/PNG del bucket S3,
lo comprime a WebP (con caché para Lighthouse), lo re-sube, actualiza la URL
del pin en la base de datos y borra el archivo viejo.

NO borra la BDD ni el bucket: reemplaza imagen por imagen.
Ejecutar en el servidor (donde está database.db) con el venv activo:
    python optimizar_imagenes.py
"""
import os
import io
import sqlite3
import boto3
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

BUCKET = os.getenv("S3_BUCKET_NAME", "visual-vault-4to-semestre")
REGION = os.getenv("AWS_REGION", "us-east-1")
DB = "database.db"
BASE_URL = f"https://{BUCKET}.s3.{REGION}.amazonaws.com/"

s3 = boto3.client(
    "s3",
    region_name=REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)


def optimizar():
    con = sqlite3.connect(DB)
    filas = con.execute("SELECT id, image_url FROM pin").fetchall()
    print(f"🔎 {len(filas)} pines en la base de datos.")

    convertidos, saltados, fallos = 0, 0, 0

    for pin_id, url in filas:
        # Ya optimizado o URL externa → saltar
        if not url or url.lower().endswith(".webp") or BASE_URL not in url:
            saltados += 1
            continue

        key = url.split(BASE_URL, 1)[1]  # ej: "Pics/Arquitectura/abc.jpg"
        try:
            data = s3.get_object(Bucket=BUCKET, Key=key)["Body"].read()

            img = Image.open(io.BytesIO(data))
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            buf = io.BytesIO()
            img.save(buf, format="webp", quality=80, optimize=True)

            nueva_key = key.rsplit(".", 1)[0] + ".webp"
            s3.put_object(
                Bucket=BUCKET,
                Key=nueva_key,
                Body=buf.getvalue(),
                ContentType="image/webp",
                CacheControl="max-age=31536000, public",
            )

            nueva_url = BASE_URL + nueva_key
            con.execute("UPDATE pin SET image_url=? WHERE id=?", (nueva_url, pin_id))
            con.commit()

            if nueva_key != key:
                s3.delete_object(Bucket=BUCKET, Key=key)

            print(f"✅ pin {pin_id}: {len(data)//1024}KB → {buf.tell()//1024}KB  ({nueva_key})")
            convertidos += 1
        except Exception as e:
            print(f"❌ pin {pin_id} ({key}): {e}")
            fallos += 1

    con.close()
    print("=" * 50)
    print(f"🎉 Listo. Optimizados: {convertidos} | Saltados: {saltados} | Fallos: {fallos}")


if __name__ == "__main__":
    optimizar()
