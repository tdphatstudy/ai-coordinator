---
id: legacy_migration_workflow
title: Legacy System Migration Workflow
description: Plan and execute migration from legacy systems with minimal business disruption.
scope: migration_compatibility_rollout
inputs: [legacy_constraints, target_architecture, data_contracts, downtime_limits]
outputs: [migration_plan, compatibility_matrix, cutover_strategy, rollback_strategy]
constraints: [dual_run_if_needed, data_integrity_required, rollback_defined]
supported_agents: [claude, codex, qwen, antigravity]
degradation_mode: use_phased_migration_when_full_cutover_risk_is_high
source: official_plus_curated_v1
---

Steps:
1. Audit legacy dependencies and contracts.
2. Define migration stages and compatibility guarantees.
3. Build data migration and verification strategy.
4. Execute phased cutover with checkpoints.
5. Validate post-migration stability and clean-up plan.
