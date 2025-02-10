#!/bin/sh

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
while ! mysqladmin ping -h"mysql" --silent; do
    sleep 2
done

echo "MySQL is ready!"

# Check if the database is already initialized
if [ ! -f /var/www/html/.db_initialized ]; then
    echo "Running database initialization..."
    php /var/www/html/db.php
    php /var/www/html/init/init.php
    touch /var/www/html/.db_initialized
    echo "Database initialization complete!"
else
    echo "Database already initialized. Skipping init.php."
fi

# Start Apache
apache2-foreground
