---
id: architecture_decision_flow
title: Architecture Decision Workflow
description: Evaluate options, trade-offs, and long-term constraints to produce defensible architecture decisions.
scope: system_design_tradeoffs_decision_records
inputs: [requirements, constraints, current_architecture, scaling_forecast]
outputs: [decision_options, tradeoff_matrix, selected_option, adr]
constraints: [explicit_tradeoffs_required, operational_impact_required]
supported_agents: [claude, codex, qwen, antigravity]
degradation_mode: present_top_two_options_with_risk_ranking
source: official_plus_curated_v1
---

Steps:
1. Gather constraints and quality attributes.
2. Build option matrix with cost and risk.
3. Evaluate failure modes and migration effort.
4. Select option with rationale and ADR.
5. Define validation milestones.
