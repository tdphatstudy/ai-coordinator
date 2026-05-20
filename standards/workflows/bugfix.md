---
id: bugfix_root_cause_and_prevention
title: Bugfix from Reproduction to Prevention
description: Resolve production defects with root-cause analysis, safe remediation, and prevention controls.
scope: debugging_fix_validation_prevention
inputs: [incident_report, logs_traces, impacted_flows, code_revision_context]
outputs: [root_cause, fix_options, selected_fix, regression_tests, prevention_actions]
constraints: [reproducible_case_required, rollback_ready, regression_test_required]
supported_agents: [claude, codex, qwen, antigravity]
degradation_mode: use_best_effort_hypothesis_with_explicit_risk_if_reproduction_is_unavailable
source: official_plus_curated_v1
---

Workflow steps:
1. Reproduce and isolate symptom boundaries.
2. Build evidence timeline from logs, traces, and state transitions.
3. Identify root cause and blast radius.
4. Compare at least two remediation options with risks.
5. Implement the lowest-risk fix with rollback strategy.
6. Add targeted regression coverage.
7. Verify production safety and monitoring thresholds.
8. Document prevention actions and ownership.
