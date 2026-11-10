# ==============================================================================
# e-Homestay PERDA - Laravel PHP 8.3-FPM Dockerfile
# ==============================================================================
FROM php:8.3-fpm-alpine

# Install system dependencies & PHP extensions required by Laravel + MySQL
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zip \
    unzip \
    oniguruma-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . /var/www/html

EXPOSE 9000
CMD ["php-fpm"]

