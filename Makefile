IMAGE_NAME ?= openai-speak-mate-core
CERT_LOCAL_DIR := /Users/andrewmysliuk
CERT_SERVER_DIR := /etc/ssl/certs
CONTAINER_NAME=backend-app-container
PORT=3001

install:
	yarn install

run:
	yarn dev

build:
	yarn build

start:
	yarn start

docker_build:
	docker build -t ${IMAGE_NAME} .

docker_run_local:
	docker run -d -p $(PORT):$(PORT) \
		-v $(CERT_LOCAL_DIR):/certs \
		-e CERT_KEY_PATH=/certs/server.key \
		-e CERT_CERT_PATH=/certs/server.crt \
		--name $(CONTAINER_NAME) $(IMAGE_NAME)

docker_run_server:
	docker run -d -p $(PORT):$(PORT) \
		-v $(CERT_SERVER_DIR):/certs \
		-e CERT_KEY_PATH=/certs/server.key \
		-e CERT_CERT_PATH=/certs/server.crt \
		--name $(CONTAINER_NAME) $(IMAGE_NAME)

stop:
	docker stop $(CONTAINER_NAME)
	docker rm $(CONTAINER_NAME)

clean_all:
	docker rm -f $(CONTAINER_NAME) || true
	docker rmi -f $(IMAGE_NAME) || true
	docker volume prune -f
	docker system prune -f --volumes

.PHONY: install run build start docker-build docker-run