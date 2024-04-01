# Transcendence

<!--toc:start-->
- [Transcendence](#transcendence)
  - [Installation](#installation)
  - [Build](#build)
<!--toc:end-->

Final project in the Codam Core.

## Installation

Before building the project you need a `.env` file that contains the parameters\
that you can find in the .env.mock file at the root of the project. You need\
to add the hostname or the IP of your current machine(ex: localhost, \
f9r9s9.codam.nl, 10.10.10.10). Also you need to replace the HOST in the \
CALLBACK_URI to match your HOST.

## Build

Run `docker compose up --build` and after everything is set up, you can connect to\
`https://HOSTNAME:4200`.
