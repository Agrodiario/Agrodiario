#!/bin/bash

# Script para testar as funcionalidades de culturas

API_URL="http://localhost:3000/api/v1"

echo "=== Teste de Culturas ==="
echo ""

# 1. Fazer login para obter token
echo "1. Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "xmoonsvnnyx@gmail.com",
    "password": "senha123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Erro ao fazer login"
  echo $LOGIN_RESPONSE | python3 -m json.tool
  exit 1
fi

echo "✅ Login realizado com sucesso"
echo ""

# 2. Buscar propriedades do usuário
echo "2. Buscando propriedades..."
PROPERTIES=$(curl -s "${API_URL}/cultures/properties" \
  -H "Authorization: Bearer ${TOKEN}")

PROPERTY_ID=$(echo $PROPERTIES | python3 -c "import sys, json; props = json.load(sys.stdin); print(props[0]['id'] if props else '')" 2>/dev/null)

if [ -z "$PROPERTY_ID" ]; then
  echo "❌ Nenhuma propriedade encontrada"
  exit 1
fi

echo "✅ Propriedade encontrada: ${PROPERTY_ID}"
echo ""

# 3. Criar uma nova cultura
echo "3. Criando nova cultura..."
CREATE_RESPONSE=$(curl -s -X POST "${API_URL}/cultures" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"propertyId\": \"${PROPERTY_ID}\",
    \"cultureName\": \"Tomate Santa Cruz\",
    \"cultivar\": \"Santa Cruz\",
    \"cycle\": 90,
    \"origin\": \"organic\",
    \"supplier\": \"Sementes Brasil\",
    \"plantingDate\": \"2025-11-01\",
    \"plantingArea\": 2.5,
    \"observations\": \"Plantio de teste\"
  }")

echo $CREATE_RESPONSE | python3 -m json.tool
echo ""

# 4. Listar todas as culturas
echo "4. Listando todas as culturas..."
LIST_RESPONSE=$(curl -s "${API_URL}/cultures?page=1&limit=5" \
  -H "Authorization: Bearer ${TOKEN}")

echo $LIST_RESPONSE | python3 -m json.tool
echo ""

echo "=== Teste concluído ==="
