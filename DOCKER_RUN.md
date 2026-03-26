# Run Docker in Development Mode

First we need to run this command with the .env.development.local file already filled

docker-compose -f docker-compose.dev.yml --env-file .env.development.local up -d

# Run Docker in Production Mode

We need to run this command within the .env file already filled

docker-compose -f docker-compose.prod.yml --env-file .env up -d
