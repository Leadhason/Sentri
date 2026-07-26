# Agent Instructions

You are working on the frontend implementation. The backend has already been implemented and should be treated as the source of truth for backend behavior.

## Frontend Specifications
- Before making frontend business logic decisions, always consult `spec.md` at the project root.
- `spec.md` defines frontend requirements, user flows, expected behavior, and business logic.
- Do not invent frontend behavior that conflicts with `spec.md`.

## Design Specificationsu
- Before making UI, UX, layout, styling, or interaction decisions, consult `design.md`.
- `design.md` is the source of truth for visual and experience decisions.
- Follow existing design patterns and guidelines instead of introducing inconsistent approaches.

## Backend Integration
- The backend is already implemented. Do not modify backend behavior unless explicitly requested.
- Before implementing frontend features that interact with backend functionality, inspect `/backend/spec.md`.
- Use `/backend/spec.md` to understand available APIs, data models, business rules, validation requirements, and backend constraints.
- Ensure frontend logic, API usage, data handling, and user flows remain consistent with the existing backend implementation.
- If the frontend requirements in `spec.md` conflict with the backend behavior documented in `/backend/spec.md`, identify the mismatch before proceeding.

## Decision Priority
When making decisions, follow this order:
1. `design.md` → visual and UX decisions
2. `spec.md` → frontend behavior and business logic
3. `/backend/spec.md` → backend contracts and constraints

## General Rules
- Always check the relevant specification files before implementing features.
- Prefer documented behavior over assumptions.
- Avoid duplicating backend business logic in the frontend unless required for user experience (e.g., validation, optimistic updates, UI state).
- Keep the frontend aligned with the existing backend implementation to prevent API and behavior mismatches.
- If requirements are unclear, inspect the specs and existing code before making assumptions.