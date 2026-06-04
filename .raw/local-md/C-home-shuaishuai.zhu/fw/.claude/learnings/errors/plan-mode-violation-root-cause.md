---
created: 2026-04-08
last_updated: 2026-04-08
source_session: retros/2026-04-08-1630.md
tags: [plan-mode, repeated-error, user-preference, workflow]
---

# Plan Mode 违规根因分析

## 问题

用户在 UI 中选择了 plan mode，但 Claude 直接在回复文本中输出完整方案，跳过了 plan mode 流程。此错误在 2026-04-07、2026-04-08（两次）共发生 3 次。

## 根因

1. **过度依赖 system reminder**: 将 `Plan mode is active` system reminder 作为唯一判据，但该 reminder 在上下文压缩后可能丢失
2. **任务类型误判**: 将"给出建议"理解为信息查询（不需要 plan），实际是实现规划（需要 plan）
3. **被纠正后未立即行动**: 收到纠正后花时间解释原因，而不是立即 EnterPlanMode

## 修复

MEMORY.md Plan Mode 规则已强化为 4 级判定逻辑：
1. 用户明确声明 → 必须 plan mode（最高优先级）
2. 用户纠正 → 立即 plan mode + 道歉
3. system reminder → 必须 plan mode
4. 均不满足 → 禁止自行进入

新增"什么算需要 plan mode 的任务"清单，明确"怎么修/如何处理/给出建议"属于实现规划。

## 判断标准

> 如果回答会产出"修改步骤列表"或"代码变更方案"，就属于实现规划，plan mode 激活时必须走 plan 流程。
