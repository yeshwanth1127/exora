export const liveIntegrations = ['WhatsApp', 'Gmail', 'Zoho', 'Slack'];

export const agentCapabilities = [
  { slug: 'customer-support', index: '01', title: 'Customer support', short: 'Triage requests, draft grounded responses, create tickets, and escalate exceptions.', signal: 'LISTEN · RESPOND · ESCALATE', controls: [
    { visual: 'source', title: 'Approved answer sources', text: 'Responses can be grounded in the knowledge and support material selected for this agent.' },
    { visual: 'route', title: 'Confidence-based handoff', text: 'Uncertain, sensitive, or exceptional requests can be routed to the responsible support person.' },
    { visual: 'conversation-record', title: 'Conversation trace', text: 'Configured support events can retain the request, response path, and escalation outcome for review.' },
  ]},
  { slug: 'inventory-procurement', index: '02', title: 'Inventory & procurement', short: 'Watch configured stock signals, coordinate purchase workflows, and surface supplier exceptions.', signal: 'MONITOR · ROUTE · REVIEW', controls: [
    { visual: 'threshold', title: 'Defined stock thresholds', text: 'The agent reacts only to configured inventory signals, reorder points, and operational rules.' },
    { visual: 'purchase-approval', title: 'Purchase approval gates', text: 'Orders above defined limits or outside approved supplier rules can require human authorization.' },
    { visual: 'exception', title: 'Supplier exception routing', text: 'Price changes, delays, and unavailable items can be surfaced to the accountable procurement owner.' },
  ]},
  { slug: 'internal-operations', index: '03', title: 'Internal operations', short: 'Route tasks, coordinate approvals, and keep cross-team work moving.', signal: 'ASSIGN · APPROVE · TRACK', controls: [
    { visual: 'owner', title: 'Named task ownership', text: 'Every routed task can retain a clear team, owner, deadline, and escalation destination.' },
    { visual: 'role-approval', title: 'Role-based approvals', text: 'Sensitive operational steps can pause until the configured decision-maker approves them.' },
    { visual: 'status', title: 'Visible work status', text: 'Configured task events can show what is waiting, approved, completed, or blocked.' },
  ]},
  { slug: 'orchestration', index: '04', title: 'Orchestration', short: 'Connect multiple agents into sequenced workflows with recovery and human escalation.', signal: 'SEQUENCE · RECOVER · GOVERN', controls: [
    { visual: 'sequence', title: 'Ordered dependencies', text: 'Agents and tools run in the defined sequence, with outputs passed only to the intended next step.' },
    { visual: 'fallback', title: 'Failure and retry paths', text: 'Timeouts or failed actions can follow configured retry, fallback, or stop conditions.' },
    { visual: 'handoff', title: 'Human interruption points', text: 'People can be brought into the workflow when a sequence reaches a sensitive or unresolved state.' },
  ]},
  { slug: 'business-logic', index: '05', title: 'Business logic', short: 'Encode policies and apply defined decision rules consistently across workflows.', signal: 'EVALUATE · DECIDE · LOG', controls: [
    { visual: 'rules', title: 'Explicit decision rules', text: 'The agent evaluates the conditions, priorities, and exceptions defined for the workflow.' },
    { visual: 'branch', title: 'Controlled branches', text: 'Each matched condition leads to a known action, approval step, or escalation path.' },
    { visual: 'decision-record', title: 'Decision evidence', text: 'Configured decisions can retain the rule, inputs, and resulting action for later inspection.' },
  ]},
  { slug: 'optimization', index: '06', title: 'Optimization', short: 'Compare process signals, identify drift, and recommend controlled improvements.', signal: 'OBSERVE · COMPARE · IMPROVE', controls: [
    { visual: 'baseline', title: 'Selected baselines', text: 'Recommendations compare only the process signals, targets, and time windows configured for analysis.' },
    { visual: 'drift', title: 'Drift detection', text: 'Meaningful movement outside defined operating ranges can be surfaced without changing the workflow.' },
    { visual: 'change-approval', title: 'Human-approved changes', text: 'Suggested improvements remain proposals until an accountable person chooses to apply them.' },
  ]},
  { slug: 'audit-compliance', index: '07', title: 'Audit & compliance', short: 'Create traceable, Ed25519-signed records for configured agent and workflow events.', signal: 'RECORD · SIGN · VERIFY', controls: [
    { visual: 'scope', title: 'Configured event scope', text: 'Only selected workflow events and connected integrations are included in the audit trail.' },
    { visual: 'signature', title: 'Ed25519 signatures', text: 'Each recorded entry is signed so its authenticity and integrity can be cryptographically verified.' },
    { visual: 'verify', title: 'Immutable verification', text: 'Once recorded, a Qlix audit entry is cryptographically impossible to modify.' },
  ]},
];

export const steps = [
  { n: '01', visual: 'prompt', title: 'Describe the outcome', text: 'Tell Qlix what the agent should achieve using natural language.' },
  { n: '02', visual: 'connect', title: 'Connect the tools', text: 'Give the agent scoped access to the channels and systems it needs.' },
  { n: '03', visual: 'bounds', title: 'Set the boundaries', text: 'Define instructions, permissions, approval points, and human ownership.' },
  { n: '04', visual: 'review', title: 'Run and review', text: 'Activate the workflow, inspect outcomes, and improve it with operational evidence.' },
];
