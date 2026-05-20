---
id: production_release_hardening
title: Production Release Hardening
description: Final hardening workflow before production release.
scope: release_readiness_performance_security_operations
inputs: [release_candidate, test_results, security_findings, runbooks]
outputs: [go_no_go, release_checklist, mitigations, monitoring_plan]
constraints: [no_critical_open_issues, rollback_tested, observability_verified]
supported_agents: [claude, codex, qwen, antigravity]
degradation_mode: block_release_if_critical_signals_are_missing
source: official_plus_curated_v1
---

Steps:
1. Verify critical test and quality gates.
2. Validate operational controls and alerts.
3. Confirm rollback and data safety path.
4. Run go/no-go review.
5. Execute staged release and post-release checks.
