
The dashboard is only for the admin and teacher and they have diffrent things based on their role and this context 

this is monorepo bhvr hono for the backend and tanstack start for the frontend 
and you have shared folder for the shared code you can use it for the frontend and backend types and interfaces


and we are using react query you can use it in hooks folder



The application is in arabic and english and by default it is in arabic and you can switch to english

so you can create en.json or ar.json files for the translations in shared folder


1. Academic Hierarchy (Core Structure)

The platform uses a mandatory academic hierarchy:

University

College

Department

Level / Grade (e.g. First Year, Second Year)

This hierarchy is used to organize:

Courses

Students

Teachers

Advertisements

Notifications

2. Users & Roles

The system uses one unified User model with role-based permissions.

Roles:

ADMIN

TEACHER

STUDENT

A single user account can only have one active role.

3. Admin

The Admin has full system control.

The Admin can:

Create, edit, and delete:

Universities, Colleges, Departments, Levels

Courses

Course content (chapters, lessons, videos, PDFs)

Advertisements

Add and manage:

Teachers

Students

Assign a teacher to any course

Approve or reject:

Course join requests

Payments

Generate and manage:

QR code batches

Manage:

User access

Course subscriptions

Student promotion/demotion

Account bans and recovery

4. Teachers

Teachers are added by the Admin.

Teacher profile includes:

Image

Name

Phone number (optional)

Email

Password

Teachers can log in to:

Dashboard

Application

Teacher Permissions

Teachers can fully manage their own courses:

Create courses

Edit courses

Add and edit:

Chapters

Lessons

Videos

PDFs

View:

Enrolled students

Sales and revenue

Course statistics

Teachers cannot:

Manage users

Modify system structure

Access other teachers’ courses

5. Students

Student profile includes:

Image

Name

Phone number

Email

Password

Students are assigned to:

University

College

Department

Level / Grade

Student Permissions

Students:

Can request access to courses

Can access courses only if they have active CourseAccess

Can:

Use QR codes

Submit payment requests

Join course chats

Contact support

Cannot modify any content or system data

6. Courses

Courses:

Are created by:

Admin or

Assigned Teacher

Each course has:

Exactly one teacher

Academic scope (University → College → Department → Level)

Price

Duration (access days)

Optional discounts

Term type:

REGULAR

SUMMER

Course Content

Chapters

Lessons

Videos (upload or YouTube preview)

PDFs

lessons or chapters

7. Course Access (Critical Rule)

Users do not own courses directly.

Access is controlled exclusively through CourseAccess:

Each access has:

Start date

Expiration date

Status (active / expired)

Access method:

QR

PAYMENT

REQUEST

When access expires:

The course is automatically removed from the user.

8. Course Enrollment Methods

Students can access courses via:

1. Join Request

Student submits a request

Admin approves or rejects

2. QR Code

Admin generates printable QR codes

Each QR code:

Works only once

Activates course access immediately

Expires after activation

3. Payment

Vodafone Cash

InstaPay

Student submits:

Payment method

Sender number

Proof image

Admin approves or rejects

9. QR Code System

QR codes are generated in batches

Each batch:

Belongs to one course

Has:

Total QR count

Course access duration

Expiration date

Each QR code:

Can be used by only one student

Cannot be reused

Admin dashboard shows:

Which QR was used

By which student

For which course

Activation date

Access expiration date

10. Chat System

The platform supports three chat types:

1. Course Chat

One chat per course

Includes:

All enrolled students

Assigned teacher

2. Personal Chat

Private chat between:

Student

Course teacher

3. Support Chat

Student ↔ Admin

Chat access is permission-based and tied to course access where applicable.

11. Notifications

Notifications are sent for:

New course available in the student’s level

New lesson added

Messages received

Course access approval or expiration

12. Key System Rules (Non-Negotiable)

Users never own courses directly

All access is time-based

QR codes are single-use

Teachers manage only their own courses

Admin can override any action

Permissions are enforced in backend logic, not database roles

13. Permissions Summary
    Admin

Full system access

Teacher

Full control over own courses

View students and revenue

Student

Access only what is granted

No modification permissions

🔐 Device ID Security Policy

The platform enforces device-based access control for STUDENT accounts only.

Device ID Rules

Each student account is bound to one active device using a deviceId.

The device ID is validated on login only.

Device checks are NOT applied during signup.

Login Behavior (Students Only)

When a student attempts to log in:

If the user has no deviceId stored:

The current device ID is saved.

Login is allowed.

If the stored deviceId matches the current device:

Login is allowed.

If the stored deviceId does NOT match the current device:

The account is temporarily blocked.

Login is denied.

The student must submit a Device Recovery Request.

Device Recovery Process

The student submits a recovery request explaining the device change.

The request includes the new device ID.

The Admin can:

Approve the request:

The old device ID is cleared.

The new device ID is saved.

The account is reactivated.

Reject the request:

The account remains blocked.

Scope Limitation

This security rule applies to:

STUDENT accounts only

It does NOT apply to:

Admin accounts

Teacher accounts

Account Creation Note

During signup, no device validation is performed.

This is intentional because:

Accounts may be created manually by the Admin.

Device validation starts from the first successful login.

🔑 Key Security Principles
This is only in the mobile application not in the website!!!!!

One student → one device

Device binding is enforced at login

Device changes require admin approval

Teachers and Admins are exempt from device restrictions

🔒 Final Note

Any feature, schema, or logic that violates this document is considered invalid by design.
