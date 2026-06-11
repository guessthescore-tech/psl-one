PSL ONE PRODUCT REQUIREMENTS DOCUMENT
Production Build Specification v1.0
Product Classification
Mission-Critical Enterprise Platform
Product Category
Sports Operating System
Deployment Model
Cloud Native SaaS
Architecture Style
Domain Driven Design (DDD)
Event Driven Architecture (EDA)
API First
Mobile First
Multi-Tenant
AI Assisted
 
PRODUCT NORTH STAR
Create the largest football supporter identity and engagement platform in Africa.
 
PRIMARY USER EXPERIENCE
Personalised Fan OS
Home Dashboard
Every fan receives a unique home screen.
Components
My Club
Today's Matches
My Fantasy Team
My Rewards
My Tickets
My Wallet
Recommended Content
Recommended Products
Recommended Sponsor Offers
Live Match Centre
Community Activity
 
INFORMATION ARCHITECTURE
PSL One

├── Home
│
├── Football
│   ├── Fixtures
│   ├── Results
│   ├── Standings
│   ├── Match Centre
│   └── Statistics
│
├── Clubs
│   ├── Club Profile
│   ├── Club News
│   ├── Club Shop
│   ├── Club Community
│   └── Club Membership
│
├── Fantasy
│   ├── My Team
│   ├── Leagues
│   ├── Transfers
│   ├── Statistics
│   └── Leaderboards
│
├── Rewards
│   ├── Wallet
│   ├── Points
│   ├── Challenges
│   ├── Rewards
│   └── History
│
├── Tickets
│   ├── Fixtures
│   ├── Purchases
│   ├── Wallet
│   └── Transfers
│
├── Marketplace
│   ├── Merchandise
│   ├── Experiences
│   ├── Travel
│   ├── Sponsors
│   └── Memberships
│
├── Community
│   ├── Fan Groups
│   ├── Polls
│   ├── Predictions
│   └── Competitions
│
└── Profile
 
ROLE MODEL
Fan
Capabilities:
• Registration
• Fantasy
• Purchases
• Ticketing
• Rewards
 
Club Administrator
Capabilities:
• Content
• Communities
• Memberships
• Reporting
 
Sponsor Administrator
Capabilities:
• Campaigns
• Rewards
• Segments
• Analytics
 
Merchant
Capabilities:
• Product Management
• Orders
• Inventory
 
PSL Administrator
Capabilities:
• Governance
• Moderation
• League Operations
 
Super Administrator
Capabilities:
• Platform Operations
 
MODULE 1
IDENTITY PLATFORM
Objective
Create a unified supporter identity layer.
 
Functional Requirements
Registration
Fields:
First Name
Last Name
Mobile Number
Email Address
Date of Birth
Gender
Province
Preferred Club
Preferred Player
Consent Preferences
 
Login
Email
Mobile
Google
Apple
Facebook
 
MFA
SMS OTP
Authenticator App
Email OTP
 
User Stories
US-IDENTITY-001
As a supporter
I want to register
So that I can access PSL One services.
 
Acceptance Criteria
• Registration completed in under 60 seconds.
• Mobile verification required.
• Consent captured.
 
US-IDENTITY-002
As a supporter
I want social login
So that registration is simplified.
 
Acceptance Criteria
• Google login supported.
• Apple login supported.
 
MODULE 2
FAN PROFILE
Purpose
Create a 360-degree supporter profile.
 
Profile Components
Personal Information
Club Affiliation
Fantasy Profile
Loyalty Profile
Commerce Profile
Ticketing Profile
Engagement Profile
 
User Stories
US-PROFILE-001
As a supporter
I want to update my club
So that recommendations remain relevant.
 
Acceptance Criteria
• Club changes recorded.
• Audit history maintained.
 
MODULE 3
FOOTBALL EXPERIENCE
Features
Fixtures
Results
Standings
Live Match Centre
Statistics
Player Profiles
Team Profiles
 
User Stories
US-FOOTBALL-001
As a supporter
I want to view fixtures
So that I know upcoming matches.
 
Acceptance Criteria
• Fixtures update automatically.
• Match status updates in real-time.
 
MODULE 4
CONTENT PLATFORM
Content Types
Articles
Videos
Highlights
Interviews
Club Content
Sponsor Content
 
AI Personalisation
Content ranking based on:
Club Affiliation
Viewing History
Engagement History
Location
Fantasy Participation
 
User Stories
US-CONTENT-001
As a supporter
I want personalised content
So that I see relevant stories.
 
MODULE 5
FANTASY FOOTBALL
Features
Create Team
Manage Squad
Transfers
Captain Selection
Private Leagues
Public Leagues
Leaderboards
 
Team Rules
Squad Size:
15 Players
Budget:
Configurable
Formation Rules:
Validated
 
User Stories
US-FANTASY-001
As a supporter
I want to build a fantasy team
So that I can compete.
 
Acceptance Criteria
• Team validation enforced.
• Budget validation enforced.
 
MODULE 6
LOYALTY ENGINE
Point Earning Activities
Registration
Profile Completion
Fantasy Participation
Ticket Purchases
Marketplace Purchases
Sponsor Activities
Community Participation
 
Tier Structure
Bronze
Silver
Gold
Platinum
Legend
 
User Stories
US-LOYALTY-001
As a supporter
I want to earn points
So that I can redeem rewards.
 
Acceptance Criteria
• Points awarded instantly.
• Audit trail maintained.
 
MODULE 7
PSL WALLET
Phase 1
Loyalty Wallet
Capabilities
Points
Vouchers
Credits
Rewards
 
Wallet Ledger
Every transaction must create:
Ledger Entry
Reference Number
Timestamp
Balance Update
Audit Event
 
MODULE 8
TICKETING
Phase 1
Aggregator
Providers
Computicket
TicketPro
Future Partners
 
Phase 3
Native Ticketing Engine
Capabilities
Seat Maps
Reservations
QR Tickets
Transfers
Validation
 
User Stories
US-TICKET-001
As a supporter
I want to purchase tickets
So that I can attend matches.
 
MODULE 9
MARKETPLACE
Categories
Merchandise
Experiences
Travel
Memberships
Sponsor Offers
 
Checkout
Cart
Promotions
Payment
Order Tracking
Returns
 
MODULE 10
COMMUNITY
Features
Fan Groups
Polls
Predictions
Competitions
Match Discussions
 
Moderation
AI Moderation
Human Moderation
Escalation Workflow
 
MODULE 11
SPONSOR ACTIVATION PLATFORM
Features
Campaign Builder
Audience Segments
Reward Builder
Offer Builder
Reporting
 
Segmentation
Age
Location
Club
Engagement
Purchasing Behaviour
Fantasy Behaviour
 
MODULE 12
CLUB PORTAL
Features
Content Publishing
Membership Management
Merchandise Management
Community Management
Analytics
 
MODULE 13
PSL OPERATIONS PORTAL
Features
League Management
Fixture Management
Sponsor Management
Content Moderation
Reporting
Compliance
 
NOTIFICATION MATRIX
Push Notifications
Goals
Fixtures
Rewards
Fantasy
Tickets
Campaigns
 
Email
Registration
Receipts
Campaigns
Weekly Digest
 
SMS
OTP
Critical Alerts
Ticket Confirmations
 
EVENT TRACKING SPECIFICATION
Track Every Event
Examples:
User Registered
Profile Updated
Fixture Viewed
Fantasy Team Created
Reward Redeemed
Ticket Purchased
Product Purchased
Campaign Viewed
Campaign Converted
 
ANALYTICS REQUIREMENTS
PSL Dashboards
Registered Fans
MAU
DAU
Engagement
Revenue
Sponsors
Clubs
 
Sponsor Dashboards
Reach
Impressions
Clicks
Conversions
Redemptions
ROI
 
Club Dashboards
Memberships
Merchandise
Engagement
Attendance
 
NON-FUNCTIONAL REQUIREMENTS
Availability:
99.95%
API Response:
<300ms
Search Response:
<500ms
Page Load:
<2 Seconds
 
SECURITY REQUIREMENTS
OAuth2
OpenID Connect
MFA
Encryption At Rest
Encryption In Transit
POPIA Compliance
PCI DSS Readiness
Audit Logging
Fraud Monitoring
 
SCALE TARGETS
Year 1
10,000 Registered Fans
50,000 MAU
 
Year 3
750,000 Registered Fans
200,000 MAU
 
Year 5
2,000,000 Registered Fans
400,000 MAU
 
CLAUDE BUILD INSTRUCTIONS
Claude shall build:
• Mobile Application (iOS)
• Mobile Application (Android)
• Responsive Web Application
• Club Portal
• Sponsor Portal
• PSL Operations Portal
• Admin Console
using:
• Next.js 15
• TypeScript
• NestJS
• PostgreSQL
• Redis
• GraphQL
• Kafka
• AWS
• Terraform
• GitHub Actions
All modules must be independently deployable and follow Domain Driven Design, Event Driven Architecture, API First Design and Enterprise Security standards.
 
PRODUCT RELEASE PLAN
Release 1
Identity
Profiles
Fixtures
Results
Content
Fantasy
Loyalty
 
Release 2
Marketplace
Communities
Memberships
Sponsor Campaigns
 
Release 3
Ticketing Engine
Financial Wallet
AI Personalisation
Digital Assets
Africa Expansion Foundation
 