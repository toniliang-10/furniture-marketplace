# Furniture Marketplace - Product Requirements Document

## Goal

Build a furniture marketplace where users browse listings and express interest in an item. When a user expresses interest, the seller gets an email notification. The real purpose is learning Spring Boot, REST APIs, and databases, so the feature set stays small and every piece maps to a concept worth knowing.

## Working method

Claude gives me the whole file implementation for each piece, and I copy it myself by hand rather than having it written directly into my files. Copying it out is how I learn. Claude's role is to provide complete, working file implementations along with explanation, plus review, bug-spotting, and direction. I do the typing.

## Learning objectives

By the end you should be comfortable with:

- Layered architecture (controller, service, repository)
- REST API design and the standard HTTP verbs
- Spring Data JPA and mapping entities to tables
- Dependency injection and beans
- Configuration via application.properties
- Sending email with Spring Mail
- Application events and async processing
- Validation and exception handling

## Tech stack

**Backend**

- Spring Boot: take the current default on start.spring.io. As of mid-2026 that is the 4.x line. Spring Boot has no LTS concept, you take the current release for new work.
- Java: 17 is the framework minimum, but use a current Java LTS instead. Java 21 or Java 25 are both LTS and fully supported by Spring Boot 4. Avoid the non-LTS interim releases.
- Spring Boot starters: spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-mail, spring-boot-starter-validation
- H2 for development (in-memory, zero setup), Postgres later
- Maven

**Frontend**

Keep it simple to start. Plain HTML/CSS/JS works, or React if you want the practice. The frontend only calls your REST API over HTTP/JSON.

**Email testing**

Use a fake SMTP catcher so you do not send real mail while developing. Mailtrap and MailHog are both commonly used for this. I am fairly sure both are still standard, but verify the current setup before relying on exact config.

## Data model

Three entities to start.

**FurnitureItem**

- id (Long, generated)
- title (String)
- description (String)
- price (BigDecimal)
- category (enum: SOFA, TABLE, CHAIR, etc.)
- imageUrl (String)
- status (enum: AVAILABLE, SOLD)
- seller (ManyToOne to Seller)
- createdAt (timestamp)

**Seller**

- id (Long, generated)
- name (String)
- email (String)
- items (OneToMany to FurnitureItem)

**Interest** (the inquiry a buyer sends)

- id (Long, generated)
- item (ManyToOne to FurnitureItem)
- buyerName (String)
- buyerEmail (String)
- message (String)
- createdAt (timestamp)

Relationships: a Seller has many FurnitureItems, and a FurnitureItem has many Interests. Start with these and add more only when you need them.

## API surface

**Furniture**

- GET /api/furniture - list all, support filtering by category and status, add pagination
- GET /api/furniture/{id} - one item
- POST /api/furniture - create a listing
- PUT /api/furniture/{id} - update
- DELETE /api/furniture/{id} - remove

**Interest** (the core feature)

- POST /api/furniture/{id}/interest - a buyer expresses interest, this triggers the email to the seller

**Sellers** (minimal)

- POST /api/sellers - create
- GET /api/sellers/{id} - view

## The email hook

This is the part worth doing well because it teaches a real Spring pattern.

When someone POSTs an interest:

1. The controller receives the request and calls InterestService
2. InterestService saves the Interest to the database
3. The service publishes an InterestCreatedEvent using ApplicationEventPublisher
4. An @EventListener (or @TransactionalEventListener) picks it up and sends the email via JavaMailSender
5. Mark the listener @Async so the HTTP response does not wait on the email to send

This decouples saving the interest from sending the email. If the mail server is slow or down, the buyer still gets a fast response and you can handle the email separately. You learn events, async, and mail in one feature.

Build the simple version first. Have InterestService call an EmailService directly, confirm an email lands in your SMTP catcher, then refactor to the event plus async approach once you understand the basics.

## Milestones

Each milestone is a working checkpoint. Do not move on until the current one runs.

**Milestone 0 - Setup**

Generate the project on start.spring.io, add the starters, run it, hit a hello endpoint. Confirm the app boots.

**Milestone 1 - Domain and database**

Create the three entities with JPA annotations. Create JpaRepository interfaces. Turn on the H2 console. Seed a few rows with a CommandLineRunner or data.sql. Confirm you can see the data in the H2 console.

**Milestone 2 - Furniture CRUD**

Build FurnitureController, FurnitureService, and FurnitureRepository. Implement all five CRUD endpoints. Test with curl or Postman. This is the heart of the REST learning.

**Milestone 3 - Browse and search**

Add derived query methods to the repository (findByCategory, findByStatus). Add filtering via query params. Add pagination with Pageable. Return only what the UI needs.

**Milestone 4 - Interest and email**

Add the interest endpoint. Wire up email. Start with a direct EmailService call, confirm an email lands in your SMTP catcher, then refactor to the event plus async design.

**Milestone 5 - Polish**

Add Bean Validation (@Valid, @NotBlank, @Email). Add a @RestControllerAdvice for clean error responses. Introduce DTOs so you stop exposing entities directly. Enable CORS so your frontend can call the API.

**Milestone 6 - Stretch**

Swap H2 for Postgres. Add basic auth or a seller login. Write tests with @WebMvcTest and @DataJpaTest. Deploy somewhere.

## Out of scope for now

Payments, real accounts and auth, image uploads to cloud storage, in-app messaging between buyer and seller, search ranking. Keep these out until the core works.

## Concept checklist

Tick these off as you hit them to track the Spring surface you have covered.

- [ ] @SpringBootApplication and how the app starts
- [ ] @RestController, @RequestMapping, @GetMapping and friends
- [ ] @Service and constructor injection
- [ ] @Repository and JpaRepository
- [ ] @Entity, @Id, @GeneratedValue, @ManyToOne, @OneToMany
- [ ] application.properties config
- [ ] H2 console
- [ ] Derived query methods
- [ ] Pageable and pagination
- [ ] DTOs and mapping
- [ ] @Valid and Bean Validation
- [ ] @RestControllerAdvice exception handling
- [ ] JavaMailSender
- [ ] ApplicationEventPublisher and @EventListener
- [ ] @Async
- [ ] @Transactional
