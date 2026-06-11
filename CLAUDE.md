Project Name:
PSL One

Vision:
The Digital Operating System of South African Football

Architecture:
Domain Driven Design
Event Driven Architecture
GraphQL Federation
Microservices
AWS Native

Backend:
NestJS
Kafka
PostgreSQL
Redis

Frontend:
NextJS
TypeScript
Tailwind
TanStack

Infrastructure:
Terraform
AWS ECS
CloudFront
EventBridge

Rules:

Never bypass RBAC.

Never bypass audit logs.

Never store business logic in frontend.

Always publish Kafka events.

Always write tests.

Always use domain boundaries.

Always create ADRs for architecture decisions.

Always assume scale to 2 million fans.