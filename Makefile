IMAGE_NAME ?= openai-speak-mate-core

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

docker-build:
	docker build -t ${IMAGE_NAME} .

docker-run:
	docker run -d -p $(PORT):$(PORT) --name $(CONTAINER_NAME) $(IMAGE_NAME)

stop:
	docker stop $(CONTAINER_NAME)
	docker rm $(CONTAINER_NAME)

clean:
	docker rmi $(IMAGE_NAME)

.PHONY: install run build start docker-build docker-run