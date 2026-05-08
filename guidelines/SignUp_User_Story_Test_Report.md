# Sign-Up User Story - Test Summary Report

## User Story
As a user (viewer), I want to sign up for an account on the platform, so that I can have a personalized viewing experience.

## Scope and Traceability
- FR1: Register new user with email and password.
- FR2: Validate email format, password strength, and already-used email with clear error messages.
- FR3: Send verification link and prevent full access until email is verified.
- NFR1 (Security): Password hashing and salting (no plain-text password storage).
- NFR2 (Performance): Redirect to homepage within 2 seconds after successful sign-up under normal conditions.

## STLC Activities

### 1) Test Planning
Test strategy was selected using the Software Testing II terminology and risk-based prioritization.

| Testing Type / Technique | Why selected for this story |
|---|---|
| Specification-based (Black-box): Equivalence Partitioning (EP) | Input classes for email/password are naturally split into valid and invalid partitions. |
| Specification-based (Black-box): Boundary Value Analysis (BVA) | Password minimum length rule (8) needs boundary checks (7, 8, 9). |
| Specification-based (Black-box): Decision Table Testing | Authentication behavior depends on combinations (new/existing email, valid/invalid password, verified/unverified state). |
| Specification-based (Black-box): Use Case Testing | Directly validates preconditions/postconditions for sign-up and verify-email flow. |
| Acceptance Test Cases | Validates business-facing outcomes from the user point of view. |
| Positive vs. Negative Test Cases | Required to cover happy path and invalid/error paths. |
| Experience-based: Error Guessing / Fault Attack | Helps target high-probability defects (duplicate email, expired token, invalid token). |
| Experience-based: Exploratory Testing (time-boxed) | Useful to validate end-to-end behavior and UI messaging quickly in realistic flows. |
| Smoke Testing | Verifies critical path after code changes (app builds and key auth endpoints respond). |
| Regression Testing | Ensures auth changes did not break existing sign-in/session behavior. |

### 2) Test Design
- Designed black-box test conditions from requirements and acceptance criteria.
- Applied EP/BVA for email/password fields.
- Built decision-rule tests for sign-up/sign-in/verification combinations.
- Prepared positive and negative acceptance scenarios.

### 3) Test Execution
- Automated execution:
  - `npm run test` -> 16 tests passed.
  - `npm run build` -> build successful.
- API/flow execution:
  - Verified `/auth/signup`, `/auth/signin`, `/auth/verify-email`, `/auth/resend-verification`, `/auth/verification-status` behavior.
  - Confirmed sign-in is blocked before verification and allowed after verification.

### 4) Test Closure
- All planned critical tests passed.
- No open blocking defects for the user story.

## Test Cases Table

| Test case ID | Name | Descriptions | Test Steps | Expected result | Actual result |
|---|---|---|---|---|---|
| TC-SU-001 | EP - Valid Email | Validate accepted email partition | 1) Enter `viewer@example.com` in sign-up | Email accepted | Pass |
| TC-SU-002 | EP - Invalid Email | Validate invalid email partition | 1) Enter `viewer.example.com` 2) Submit | Clear invalid email error message | Pass |
| TC-SU-003 | BVA - Password Length Below Boundary | Validate lower invalid boundary | 1) Enter 7-char password with special char 2) Submit | Clear "at least 8 characters" error | Pass |
| TC-SU-004 | BVA - Password Length at Boundary | Validate exact valid boundary | 1) Enter 8-char password with special char 2) Submit | Password accepted | Pass |
| TC-SU-005 | EP - Missing Special Character | Validate weak password partition | 1) Enter 8+ chars without special char 2) Submit | Clear special-character error | Pass |
| TC-SU-006 | Use Case - Successful Sign-up | Validate sign-up postcondition | 1) Sign up with valid email/password 2) Observe redirect/message | Account created, redirected to homepage, verification required message shown | Pass |
| TC-SU-007 | Decision Table - Duplicate Email | Validate existing-email rule | 1) Sign up with an already-used email | Clear "already in use" error | Pass |
| TC-SU-008 | Negative - Sign-in Before Verification | Ensure full access is blocked | 1) Try sign-in before clicking verification link | Sign-in blocked with email-not-verified message | Pass |
| TC-SU-009 | Use Case - Verify Email Link Success | Validate verification postcondition | 1) Open verification URL 2) Check redirect URL params | Redirect to `/login?verified=success...` and account marked verified | Pass |
| TC-SU-010 | Negative - Invalid/Used Verification Token | Validate token error handling | 1) Open invalid or reused verification token URL | Redirect to `/login?verified=failed...` with clear failure state | Pass |
| TC-SU-011 | Acceptance - Verification Status Check | Validate user-facing status check | 1) Open login 2) Use "Check verification status" card with email | Shows correct state (not found / unverified / verified) | Pass |
| TC-SU-012 | Acceptance - Resend Verification | Validate resend flow | 1) Use resend action for unverified account | New verification link generated and message shown | Pass |
| TC-SU-013 | Security (NFR1) - Hashing and Salting | Verify secure credential storage design | 1) Inspect auth implementation 2) Check PBKDF2 + unique salt usage | Password stored as hash+salt, never plain text | Pass |
| TC-SU-014 | Performance (NFR2) - Redirect Timing | Verify redirect responsiveness | 1) Complete successful sign-up 2) Observe immediate navigation to homepage | Redirect starts immediately and meets normal-condition target | Pass |
| TC-SU-015 | Smoke Test - Build and Critical Auth Flow | Validate release readiness | 1) Run build 2) Execute key auth endpoints | Build succeeds; core auth endpoints respond correctly | Pass |
| TC-SU-016 | Regression - Existing Sign-in Session Handling | Ensure previous behavior not broken | 1) Sign in verified user 2) Confirm token/session handling | Token stored, user session loaded correctly | Pass |

## Final Assessment
- Test summary status: PASS.
- Acceptance criteria coverage: fully covered by black-box, acceptance, and negative/positive scenarios.
- FR/NFR coverage: FR1/FR2/FR3 + NFR1/NFR2 satisfied for this user story.
