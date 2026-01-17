# Project Context – Educational Platform

This file describes the full system context and rules.
It must be read before making any architectural or coding decisions.

## Academic Hierarchy (Core Structure)

The platform is built on four mandatory academic levels:

1. University
2. College
3. Department
4. Level / Grade (e.g. First Year, Second Year)

This hierarchy is used across:

- Courses
- Teachers
- Students
- Advertisements
- Permissions

## Sections (Categories)

- Created and managed by the Admin.
- When creating a section, the admin must select:
  - University
  - College
  - Department
  - Level / Grade
- Sections can be nested (main section → sub-sections).
- Sections define:
  - Where courses appear.
  - Which teachers and students belong to them.

## Teachers

- Added only by the Admin.
- Teacher data:
  - Profile image
  - Name
  - Phone number (optional)
  - Email
  - Password
- Teachers can log in to:
  - Dashboard
  - Application
- Admin can disable a teacher completely.
- Teachers are assigned to:
  - University
  - College
  - Department
  - Level / Grade
- Teachers can:
  - View enrolled students
  - View sales and revenue
  - Manage their own course content
- Teachers have no system-level permissions.

## Courses

- Created, edited, and deleted by the Admin.
- Course data:
  - Name
  - Image
  - Assigned teacher
  - Academic scope (University → College → Department → Level)
  - Price
- Content:
  - Lessons and chapters
  - PDFs
  - Videos (upload or YouTube preview)
- Features:
  - Free lessons or chapters
  - Paid content
- Admin controls student access.

## Advertisements

- Advertisement includes:
  - Image
  - Name
  - Active duration
- Ads can be linked to:
  - Department
  - Teacher
  - Course
- Ads expire automatically after duration ends.

## Students

- Student data:
  - Profile image
  - Name
  - Phone
  - Email
  - Password
- Assigned to:
  - University
  - College
  - Department
  - Level / Grade
- Admin can:
  - Promote or demote students
  - Change department
  - Reset access
  - Reset MAC address
  - Block or unblock accounts

## Permissions Summary

- Admin:
  - Full control over the entire platform.
  - Creates and manages:
    - Teachers
    - Students
    - Courses
    - Course content (videos, PDFs, lessons, chapters)
    - Advertisements
    - Academic structure (University, College, Department, Level)
  - Assigns content and courses to teachers and students.

- Teacher:
  - Has NO permission to create, edit, or delete content.
  - Can ONLY view dashboard data:
    - Number of subscribed students
    - Enrolled courses
    - Sales / revenue statistics
  - Cannot modify courses, lessons, videos, or PDFs.
  - Cannot manage students or system settings.

- Student:
  - Can only access content assigned by the Admin.
  - Has no management or modification permissions.
