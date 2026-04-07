#!/bin/sh
set -e

: "${ADMIN_EMAIL:=admin@alatoo.edu.kg}"
: "${ADMIN_PASSWORD:=Admin123!}"
: "${ADMIN_FULL_NAME:=System Administrator}"

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set admin_email="$ADMIN_EMAIL" \
  --set admin_password="$ADMIN_PASSWORD" \
  --set admin_full_name="$ADMIN_FULL_NAME" <<-'EOSQL'
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (username, password, full_name, role, is_active, is_verified)
VALUES (
  :'admin_email',
  crypt(:'admin_password', gen_salt('bf')),
  :'admin_full_name',
  'admin',
  TRUE,
  TRUE
)
ON CONFLICT (username) DO UPDATE
SET
  password = EXCLUDED.password,
  full_name = EXCLUDED.full_name,
  role = 'admin',
  is_active = TRUE,
  is_verified = TRUE,
  updated_at = CURRENT_TIMESTAMP;
EOSQL
