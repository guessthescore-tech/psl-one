PSL ONE 

ENTERPRISE ARCHITECTURE BLUEPRINT 

Version 1.0 

The Digital Operating System of South African Football 

 

DOCUMENT CONTROL 

Document: 

PSL One Enterprise Architecture Blueprint 

Version: 

1.0 

Classification: 

Confidential 

Audience: 

Enterprise Architects 

Solution Architects 

Engineering Teams 

Security Teams 

AWS Architects 

DevOps Teams 

Product Teams 

Technical Partners 

 

EXECUTIVE SUMMARY 

PSL One is designed as a cloud-native, event-driven, multi-tenant sports operating system. 

The architecture shall support: 

2 Million Registered Fans 

400,000 Monthly Active Users 

League Scale Operations 

Club Scale Operations 

Sponsor Scale Operations 

Future African Expansion 

The platform will be built using modern enterprise architecture principles to ensure: 

Scalability 

Security 

Availability 

Extensibility 

Maintainability 

 

ARCHITECTURAL PRINCIPLES 

Principle 1 

Cloud Native 

All services must be deployable independently. 

 

Principle 2 

Domain Driven Design 

Business domains own business logic. 

 

Principle 3 

Event Driven Architecture 

Business events drive workflows. 

 

Principle 4 

API First 

Every capability exposed through APIs. 

 

Principle 5 

Security By Design 

Security embedded throughout architecture. 

 

Principle 6 

Observability First 

Everything measurable. 

 

TARGET ARCHITECTURE 

Users 
 
├── Mobile Apps 
├── Web Platform 
├── Club Portal 
├── Sponsor Portal 
└── PSL Portal 
 
            │ 
 
            ▼ 
 
      CloudFront CDN 
 
            │ 
 
            ▼ 
 
       AWS WAF 
 
            │ 
 
            ▼ 
 
       API Gateway 
 
            │ 
 
            ▼ 
 
   GraphQL Federation 
 
            │ 
 
            ▼ 
 
  Event Driven Services 
 
            │ 
 
┌───────────────────────────┐ 
│                           │ 
▼                           ▼ 
 
Business Services       Data Platform 
 
└───────────────────────────┘ 
 

 

C4 MODEL 

Level 1 

System Context 

Supporters 
Clubs 
Sponsors 
PSL 
Merchants 
Ticketing Providers 
Banking Partners 
 
          │ 
 
          ▼ 
 
        PSL One 
 

 

LEVEL 2 

CONTAINER ARCHITECTURE 

Frontend 
 
├── Mobile App 
├── Web App 
├── Club Portal 
├── Sponsor Portal 
└── Admin Portal 
 
Backend 
 
├── API Gateway 
├── GraphQL Layer 
├── Microservices 
└── Event Bus 
 

 

BOUNDED CONTEXTS 

Identity Domain 

Responsible For: 

Registration 

Authentication 

MFA 

Consent 

Owns: 

User 

Identity 

Sessions 

 

Fan Domain 

Responsible For: 

Profiles 

Preferences 

Club Affiliation 

Owns: 

Fan Profile 

 

Content Domain 

Responsible For: 

News 

Highlights 

Media 

Owns: 

Articles 

Videos 

 

Fantasy Domain 

Responsible For: 

Teams 

Leagues 

Scoring 

Owns: 

Fantasy Teams 

 

Loyalty Domain 

Responsible For: 

Points 

Rewards 

Tiers 

Owns: 

Loyalty Accounts 

 

Wallet Domain 

Responsible For: 

Wallet Balances 

Transactions 

Ledger 

Owns: 

Wallet Accounts 

 

Ticketing Domain 

Responsible For: 

Events 

Tickets 

Validation 

Owns: 

Tickets 

 

Marketplace Domain 

Responsible For: 

Products 

Orders 

Vendors 

Owns: 

Orders 

 

Sponsor Domain 

Responsible For: 

Campaigns 

Segments 

Reporting 

Owns: 

Campaigns 

 

Club Domain 

Responsible For: 

Clubs 

Memberships 

Communities 

Owns: 

Club Assets 

 

Analytics Domain 

Responsible For: 

Reporting 

Metrics 

Dashboards 

Owns: 

Analytical Models 

 

MICROSERVICE ARCHITECTURE 

Identity Service 
 
Fan Service 
 
Club Service 
 
Content Service 
 
Fantasy Service 
 
Loyalty Service 
 
Wallet Service 
 
Ticketing Service 
 
Marketplace Service 
 
Sponsor Service 
 
Analytics Service 
 
Notification Service 
 
Search Service 
 
Media Service 
 

All services independently deployable. 

 

EVENT DRIVEN ARCHITECTURE 

Event Bus 

Apache Kafka 

 

Event Categories 

Identity Events 

UserRegistered 

UserVerified 

UserLoggedIn 

 

Loyalty Events 

PointsAwarded 

RewardRedeemed 

TierUpgraded 

 

Commerce Events 

OrderPlaced 

OrderPaid 

OrderShipped 

 

Ticket Events 

TicketPurchased 

TicketTransferred 

TicketValidated 

 

Fantasy Events 

FantasyTeamCreated 

FantasyTransferMade 

FantasyPointsAwarded 

 

EVENT FLOW 

Ticket Purchased 
 
       │ 
 
       ▼ 
 
TicketPurchased Event 
 
       │ 
 
┌─────┼───────────┐ 
 
▼                 ▼ 
 
Loyalty         Analytics 
 
▼                 ▼ 
 
Wallet         Sponsor Engine 
 

 

DATA ARCHITECTURE 

Operational Databases 

PostgreSQL 

Purpose: 

Transactional Data 

 

Cache Layer 

Redis 

Purpose: 

Performance 

 

Search Engine 

OpenSearch 

Purpose: 

Full Text Search 

 

Data Lake 

Amazon S3 

Purpose: 

Raw Data 

 

Data Warehouse 

Snowflake 

Purpose: 

Analytics 

 

DATABASE STRATEGY 

Database Per Service 

Example: 

Identity DB 
 
Fan DB 
 
Loyalty DB 
 
Wallet DB 
 
Ticketing DB 
 

No shared databases. 

 

INTEGRATION ARCHITECTURE 

External Integrations 

TicketPro 

Computicket 

Payment Providers 

Banking Partner 

Fantasy Data Provider 

Statistics Providers 

Marketing Platforms 

Email Providers 

SMS Providers 

WhatsApp Provider 

 

API STRATEGY 

Public APIs 

Mobile 

Web 

Partners 

 

Internal APIs 

Service-to-Service 

 

Standards 

REST 

GraphQL 

OpenAPI 3 

 

SECURITY ARCHITECTURE 

Identity Security 

OAuth2 

OpenID Connect 

MFA 

 

Application Security 

Rate Limiting 

Bot Protection 

CSRF Protection 

XSS Protection 

Input Validation 

 

Data Security 

Encryption At Rest 

Encryption In Transit 

Secrets Management 

 

AWS Security 

IAM 

KMS 

Secrets Manager 

GuardDuty 

Security Hub 

CloudTrail 

 

COMPLIANCE ARCHITECTURE 

POPIA 

PCI DSS Readiness 

GDPR Ready 

Audit Logging 

Consent Tracking 

Data Retention Policies 

 

AI ARCHITECTURE 

AI Use Cases 

Content Recommendations 

Reward Recommendations 

Product Recommendations 

Fraud Detection 

Fan Segmentation 

Sponsor Audience Selection 

 

AI Components 

Feature Store 

Model Registry 

Recommendation Engine 

Inference API 

 

SEARCH ARCHITECTURE 

OpenSearch 

Indexed Entities: 

Players 

Clubs 

Fixtures 

Products 

Articles 

Rewards 

Sponsors 

 

NOTIFICATION ARCHITECTURE 

Channels: 

Push 

Email 

SMS 

WhatsApp 

In-App 

 

Notification Service 

Event Driven 

Template Based 

Multi-Language Ready 

 

OBSERVABILITY ARCHITECTURE 

Logging 

CloudWatch 

OpenSearch 

 

Metrics 

Prometheus 

Grafana 

 

Tracing 

OpenTelemetry 

AWS X-Ray 

 

DEVOPS ARCHITECTURE 

Source Control 

GitHub 

 

CI/CD 

GitHub Actions 

 

Infrastructure 

Terraform 

 

Deployment 

AWS ECS Fargate 

 

AWS REFERENCE ARCHITECTURE 

CloudFront 
 
   │ 
 
WAF 
 
   │ 
 
API Gateway 
 
   │ 
 
GraphQL Layer 
 
   │ 
 
Microservices 
 
   │ 
 
Kafka 
 
   │ 
 
PostgreSQL 
 
Redis 
 
OpenSearch 
 
S3 
 
Snowflake 
 

 

DISASTER RECOVERY 

Availability 

99.95% 

 

RTO 

4 Hours 

 

RPO 

15 Minutes 

 

MULTI-TENANCY MODEL 

Level: 

Logical Multi-Tenancy 

 

Tenant Types: 

PSL 

Clubs 

Sponsors 

Merchants 

 

PERFORMANCE TARGETS 

API Response 

<300ms 

 

Search 

<500ms 

 

Page Load 

<2 Seconds 

 

CAPACITY TARGETS 

Year 1 

50,000 MAU 

 

Year 3 

200,000 MAU 

 

Year 5 

400,000 MAU 

 

TECHNOLOGY STACK 

Frontend 

Next.js 15 

TypeScript 

Tailwind 

ShadCN 

 

Backend 

NestJS 

TypeScript 

GraphQL 

Kafka 

 

Data 

PostgreSQL 

Redis 

OpenSearch 

Snowflake 

 

Cloud 

AWS 

 

Infrastructure 

Terraform 

GitHub Actions 

ECS Fargate 

 

ARCHITECTURE GOVERNANCE 

Architecture Review Board 

Security Review Board 

Technical Design Authority 

Change Advisory Board 

 

BUILD AUTHORITY STATEMENT 

All PSL One engineering teams, AI coding agents and implementation partners shall adhere to: 

Domain Driven Design 

Event Driven Architecture 

Cloud Native Principles 

API First Design 

Security By Design 

Observability Standards 

No implementation may violate this architecture without approval from the Technical Design Authority. 