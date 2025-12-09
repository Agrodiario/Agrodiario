#!/bin/sh
set -e

echo "Running database migrations..."
# Use TypeORM CLI with the compiled data source
node ./node_modules/typeorm/cli.js migration:run -d ./dist/database/data-source.js || {
  echo "Migration failed, but continuing startup..."
}

echo "Starting application..."
exec node dist/main.js
