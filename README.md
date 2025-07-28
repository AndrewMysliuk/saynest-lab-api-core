# Saynest Lab API Core

Saynest Labs is a language learning platform that helps users improve their spoken communication through AI-driven conversational modules. This repository contains the core backend for managing sessions, analyzing responses, and integrating with large language models like OpenAI.

## Features

- Session-based dialog system with real-time AI interaction
- Customizable conversational modules for different learning goals
- User error analysis (grammar, vocabulary, pronunciation)
- Adaptive prompts and feedback based on user performance
- MongoDB-based session and user data storage
- OpenAI GPT integration with flexible system instructions

## Tech Stack

- Node.js + TypeScript
- Express.js
- MongoDB
- OpenAI API
- Google API
- Docker
- Yarn

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/AndrewMysliuk/saynest-lab-api-core.git
```

### 2. Install dependencies

```
yarn install
```

### 3. Run backend application

```
yarn dev
```

### 4. Build and run application

```
yarn build && yarn start
```

### 5. Build and run Docker

```
make docker_build && make docker_run_local
```
