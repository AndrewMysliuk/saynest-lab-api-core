IMAGE_NAME ?= openai-speak-mate-core
CERT_LOCAL_DIR := /Users/andrewmysliuk
CERT_SERVER_DIR := /etc/ssl/certs
CONTAINER_NAME=backend-app-container

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
	docker run -d \
		--env-file .env \
		-v "$(shell pwd)/speak-mate-mvp-5f8c7bbc58d1.json":/app/speak-mate-mvp-5f8c7bbc58d1.json \
		-p 3001:3001 \
  		--name $(CONTAINER_NAME) $(IMAGE_NAME)

stop:
	docker stop $(CONTAINER_NAME)
	docker rm $(CONTAINER_NAME)

clean_all:
	docker rm -f $(CONTAINER_NAME) || true
	docker rmi -f $(IMAGE_NAME) || true
	docker volume prune -f
	docker system prune -f --volumes

mongo_local_start:
	mongod --dbpath ~/mongodb/replica --replSet rs0

mongo_local_drop_all:
	rm -rf ~/mongodb/replica

.PHONY: install run build start docker-build docker-run