---
id: feature_delivery_idea_to_production
title: Feature Delivery from Idea to Production
description: Structured workflow for planning, implementation, validation, and rollout of new product capabilities.
scope: discovery_planning_implementation_release
inputs: [problem_statement, success_metrics, constraints, deadline]
outputs: [plan, implementation, tests, rollout_notes, post_release_checks]
constraints: [incremental_delivery, test_gate_required, rollback_plan_required]
supported_agents: [claude, codex, qwen, antigravity]
degradation_mode: split_release_into_minimal_safe_increment_when_scope_is_high
source: official_plus_curated_v1
---

Workflow steps:
1. Discovery: define user problem, success metrics, and boundaries.
2. Planning: break work into milestones with acceptance criteria.
3. Architecture: identify integration points and migration requirements.
4. Implementation: deliver in small verifiable slices.
5. Testing: execute unit/integration/e2e checks for changed behavior.
6. Release prep: create monitoring, rollback, and support notes.
7. Launch: perform staged rollout and verify success metrics.
8. Post-release: document learnings and follow-up improvements.
