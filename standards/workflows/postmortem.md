---
id: postmortem_learning_loop
title: Incident Postmortem and Learning Loop
description: Convert incidents into durable engineering improvements.
scope: analysis_accountability_prevention
inputs: [incident_timeline, logs, mitigation_actions, impact_report]
outputs: [root_cause_tree, contributing_factors, corrective_actions, ownership_plan]
constraints: [blameless_analysis, evidence_required, actionable_outcomes_required]
supported_agents: [claude, codex, qwen, antigravity]
degradation_mode: capture_preliminary_actions_then_schedule_deeper_follow_up
source: official_plus_curated_v1
---

Steps:
1. Build factual timeline.
2. Identify direct and systemic causes.
3. Define corrective and preventive actions.
4. Assign owners and deadlines.
5. Track closure and verify risk reduction.
