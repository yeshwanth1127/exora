import { Link, Navigate, useParams } from 'react-router-dom';
import { SiGmail, SiSlack, SiWhatsapp, SiZoho } from 'react-icons/si';
import { agentCapabilities, liveIntegrations, steps } from './content';
import OrbitImages from './OrbitImages';

const Arrow = () => <span aria-hidden>↗</span>;
const Eyebrow = ({ children }) => <div className="mx-eyebrow"><i />{children}</div>;
const CtaPair = () => <div className="mx-actions"><Link className="mx-button mx-button-light" to="/contact">Start a conversation <Arrow /></Link><a className="mx-button mx-button-ghost" href="https://qlix.exora.solutions">Open Qlix <Arrow /></a></div>;

function WorkflowVisual({ type }) {
  return <div className={`mx-workflow-visual is-${type}`} aria-hidden="true">
    {type === 'prompt' && <><div className="mx-visual-prompt"><i /><i /><i /></div><span className="mx-visual-caret" /></>}
    {type === 'connect' && <><span className="mx-visual-hub">Q</span><i className="mx-node n1"/><i className="mx-node n2"/><i className="mx-node n3"/><i className="mx-node n4"/></>}
    {type === 'bounds' && <><div className="mx-visual-bound"><i/><span>✓</span></div><i className="mx-bound-line l1"/><i className="mx-bound-line l2"/></>}
    {type === 'review' && <><div className="mx-visual-chart"><i/><i/><i/><i/></div><span className="mx-review-scan"/></>}
  </div>;
}

function ControlVisual({ type }) {
  const diagrams = {
    source: <><rect x="22" y="30" width="48" height="56" rx="6"/><path d="M32 45h28M32 56h22M32 67h17"/><circle className="accent-fill" cx="91" cy="58" r="18"/><path className="dark" d="m83 58 6 6 11-13"/></>,
    route: <><circle className="accent-fill" cx="27" cy="60" r="8"/><path d="M35 60h29m0 0 18-22m-18 22 18 22"/><circle cx="89" cy="34" r="8"/><rect x="81" y="75" width="18" height="14" rx="3"/></>,
    'conversation-record': <><path d="M20 30h73v43H56L42 85V73H20z"/><path d="M31 43h48M31 54h35"/><circle className="accent" cx="91" cy="83" r="14"/><path d="m85 83 4 4 8-9"/></>,
    threshold: <><path d="M18 88h84M25 82V63m20 19V44m20 38V55m20 27V27"/><path className="acid" d="M16 49h88"/><circle className="acid-fill" cx="85" cy="49" r="4"/></>,
    'purchase-approval': <><path d="M23 34h55l8 45H31zM36 34l6-12h20l6 12"/><circle className="accent-fill" cx="91" cy="78" r="17"/><path className="dark" d="m84 78 5 5 9-11"/></>,
    exception: <><path d="M18 59h38m0 0 16-25m-16 25 16 25"/><circle className="accent-fill" cx="81" cy="29" r="7"/><path className="acid" d="M81 24v7m0 4v1"/><path d="M76 78h13l8 9"/><circle cx="101" cy="91" r="5"/></>,
    owner: <><circle cx="60" cy="38" r="14"/><path d="M34 88c3-21 13-31 26-31s23 10 26 31"/><circle className="accent-fill" cx="90" cy="39" r="12"/><path className="dark" d="M90 32v14m-7-7h14"/></>,
    'role-approval': <><circle cx="35" cy="43" r="11"/><circle cx="85" cy="43" r="11"/><path d="M18 82c2-17 8-25 17-25s15 8 17 25M68 82c2-17 8-25 17-25s15 8 17 25"/><path className="accent" d="M49 45h22m-6-6 6 6-6 6"/></>,
    status: <><rect x="18" y="28" width="84" height="62" rx="7"/><path d="M31 43h28M31 59h42M31 75h35"/><circle className="acid-fill" cx="88" cy="43" r="5"/><circle className="accent-fill" cx="88" cy="59" r="5"/><circle cx="88" cy="75" r="5"/></>,
    sequence: <><circle className="accent-fill" cx="20" cy="60" r="7"/><circle cx="47" cy="60" r="7"/><circle cx="74" cy="60" r="7"/><circle className="acid-fill" cx="101" cy="60" r="7"/><path d="M27 60h13m14 0h13m14 0h13"/></>,
    fallback: <><path d="M18 42h58l14 15-14 15H46"/><path className="accent" d="M46 72 34 84 22 72M34 84V58"/><circle className="acid-fill" cx="93" cy="57" r="7"/></>,
    handoff: <><path d="M19 48h48m-9-9 9 9-9 9"/><path d="M53 74h48m-39-9-9 9 9 9"/><circle className="accent-fill" cx="27" cy="48" r="7"/><circle className="acid-fill" cx="93" cy="74" r="7"/></>,
    rules: <><path d="M24 27h72v66H24zM35 42h18m12 0h20M35 59h18m12 0h20M35 76h18m12 0h20"/><path className="accent" d="m39 42 4 4 8-10m-12 23 4 4 8-10m-12 23 4 4 8-10"/></>,
    branch: <><path d="M18 60h28m0 0 17-25m-17 25 17 25M63 35h31M63 85h31"/><rect className="accent" x="94" y="27" width="10" height="16" rx="2"/><circle className="acid-fill" cx="99" cy="85" r="6"/></>,
    'decision-record': <><path d="M22 25h61v70H22zM34 41h37M34 53h25M34 74h16"/><path className="accent" d="M72 66 98 92m0-26L72 92"/><circle className="acid-fill" cx="52" cy="74" r="4"/></>,
    baseline: <><path d="M18 89h86M25 83l19-18 18 8 20-34 15 12"/><path className="accent" d="M18 60h86"/><path className="acid" d="M18 42h86"/></>,
    drift: <><path d="M18 84h86M24 72c16 0 16-23 32-23s16 10 27-4 10-20 18-25"/><path className="accent" d="M18 65h86M18 35h86"/><circle className="acid-fill" cx="83" cy="45" r="5"/></>,
    'change-approval': <><path d="M25 73a36 36 0 0 1 58-33m0 0V26m0 14H69M95 48a36 36 0 0 1-58 33m0 0v14m0-14h14"/><circle className="accent-fill" cx="60" cy="60" r="17"/><path className="dark" d="m52 60 6 6 11-13"/></>,
    scope: <><rect x="23" y="25" width="74" height="70" rx="5"/><path d="M23 46h74M45 25v70"/><rect className="accent" x="52" y="54" width="36" height="32" rx="3"/><path className="acid" d="m61 70 6 6 12-14"/></>,
    signature: <><path d="M20 76c14-30 22 11 34-17s6 34 23 2 12 24 26-5"/><path d="M20 91h83"/><circle className="accent" cx="87" cy="35" r="16"/><path d="M80 35h14m-7-7v14"/></>,
    verify: <><path d="M60 20 94 32v25c0 22-14 35-34 43-20-8-34-21-34-43V32z"/><path className="acid" d="m45 58 10 10 21-24"/><circle className="accent" cx="60" cy="60" r="26"/></>,
  };
  return <div className={`mx-control-visual is-${type}`} aria-hidden="true"><svg viewBox="0 0 120 120" role="presentation">{diagrams[type]}</svg></div>;
}

function FeatureVisual({ type }) {
  const diagrams = {
    language: <><path d="M20 31h80v48H58L43 92V79H20z"/><path d="M32 45h43M32 56h30"/><path className="accent" d="M82 43v18m-7-9h14"/><circle className="acid-fill" cx="91" cy="74" r="5"/></>,
    connections: <><circle className="accent-fill" cx="60" cy="60" r="13"/><circle cx="24" cy="31" r="8"/><rect x="88" y="23" width="16" height="16" rx="4"/><circle cx="24" cy="89" r="8"/><rect x="88" y="81" width="16" height="16" rx="4"/><path d="m31 36 18 15m22 0 18-15M31 84l18-15m22 0 18 15"/></>,
    control: <><path d="M60 18 94 31v25c0 22-14 35-34 45-20-10-34-23-34-45V31z"/><path className="accent" d="M42 58h36M48 46v24m24-24v24"/><circle className="acid-fill" cx="48" cy="54" r="4"/><circle className="acid-fill" cx="72" cy="63" r="4"/></>,
    review: <><path d="M20 87h80M27 80V57m20 23V40m20 40V51m20 29V29"/><path className="accent" d="M23 67 44 51l20 9 25-24"/><circle className="acid-fill" cx="89" cy="36" r="5"/><path d="M72 91h25"/></>,
    agent: <><circle cx="60" cy="55" r="25"/><path d="M45 53h30M52 43v20m16-20v20"/><circle className="accent-fill" cx="52" cy="51" r="4"/><circle className="acid-fill" cx="68" cy="51" r="4"/><path d="M49 69c7 5 15 5 22 0M60 30V18m-6 0h12"/></>,
    workflow: <><rect x="15" y="50" width="22" height="22" rx="5"/><circle className="accent" cx="60" cy="61" r="13"/><path d="M83 50h22v22H83zM37 61h10m26 0h10"/><path className="acid" d="m42 56 5 5-5 5m36-10 5 5-5 5"/></>,
    support: <><path d="M31 63v-9a29 29 0 0 1 58 0v9"/><path d="M31 60H20v23h16V62m53-2h11v23H84V62M84 84c-4 10-11 14-24 14"/><circle className="acid-fill" cx="56" cy="98" r="4"/><path className="accent" d="M48 48h24M48 58h17"/></>,
  };
  return <div className={`mx-feature-visual is-${type}`} aria-hidden="true"><svg viewBox="0 0 120 120" role="presentation">{diagrams[type]}</svg></div>;
}

function ProductConsole() {
  return <div className="mx-console" aria-label="Illustrative Qlix agent builder">
    <div className="mx-console-top"><div className="mx-console-brand"><img src="/logo_solo.png" alt="" /><b>qlix</b></div><span>AGENT STUDIO</span><div className="mx-status"><i />READY</div></div>
    <div className="mx-console-grid"><aside><span>BUILD</span><b>Instruction</b><b>Knowledge</b><b>Connections</b><span>CONTROL</span><b>Permissions</b><b>Approvals</b><b>Audit</b></aside><div className="mx-prompt"><span>NATURAL LANGUAGE BUILDER</span><h3>What should your agent do?</h3><div className="mx-input">Monitor our support inbox, answer from approved knowledge, and send uncertain cases to a person.<i>↗</i></div><div className="mx-chips"><span>Gmail connected</span><span>Human approval</span><span>Audit enabled</span></div><div className="mx-flow"><b>INBOX</b><i>→</i><b>QLIX AGENT</b><i>→</i><b>REVIEW</b></div></div></div>
    <div className="mx-console-foot"><span>Illustrative interface</span><span>ED25519 SIGNING · ACTIVE</span></div>
  </div>;
}

export function HomePage() {
  return <main>
    <section className="mx-hero mx-home-hero">
      <div className="mx-orbit" aria-hidden><span>BUILD</span><span>CONNECT</span><span>CONTROL</span></div>
      <h1>Your AI workforce.<br/><em>Built by you.</em><br/>Governed by Qlix.</h1>
      <p className="mx-lede">Create capable AI agents through natural language, connect them to the tools you already use, and keep every important action within clear human boundaries.</p>
      <CtaPair />
      <div className="mx-hero-note"><span>NO-CODE AGENT BUILDER</span><span>CLOUD OR LOCAL</span><span>ED25519-SIGNED AUDIT RECORDS</span></div>
    </section>
    <section className="mx-showcase mx-product-shot"><div className="mx-product-shot-bar"><span>QLIX / AI BUILDER</span><span>ACTUAL PRODUCT INTERFACE</span></div><img src="/qlix-agent-builder.jpeg" alt="Qlix AI Builder interface for creating an agent with natural-language instructions" /></section>
    <section className="mx-statement"><Eyebrow>THE PRODUCT</Eyebrow><h2>Ideas become agents.<br/>Agents become operations.</h2><p>Qlix turns a plain-language instruction into a working agent with connections, boundaries, approvals, and review built around it.</p></section>
    <section className="mx-section"><div className="mx-section-head"><Eyebrow>HOW QLIX WORKS</Eyebrow><h2>From prompt to<br/>production workflow.</h2></div><ol className="mx-step-grid">{steps.map(s=><li key={s.n}><span>{s.n}</span><WorkflowVisual type={s.visual}/><h3>{s.title}</h3><p>{s.text}</p></li>)}</ol></section>
    <section className="mx-section mx-agent-section"><div className="mx-section-head"><Eyebrow>CAPABILITY LIBRARY</Eyebrow><h2>Start with a job<br/>that needs doing.</h2><p>Build from scratch or shape a Qlix agent around a common operational responsibility.</p></div><div className="mx-agent-list">{agentCapabilities.map(a=><Link to={`/agents/${a.slug}`} key={a.slug}><span>{a.index}</span><h3>{a.title}</h3><p>{a.signal}</p><i>↗</i></Link>)}</div></section>
    <section className="mx-section mx-split"><div><Eyebrow>BUILT FOR REAL SYSTEMS</Eyebrow><h2>Meet your tools<br/>where they are.</h2><p>Qlix agents work through configured integrations and scoped access—not an isolated demo environment.</p></div><div className="mx-orbit-shell"><OrbitImages items={[<SiGmail aria-label="Gmail"/>,<SiSlack aria-label="Slack"/>,<SiWhatsapp aria-label="WhatsApp"/>,<SiZoho aria-label="Zoho"/>]} shape="ellipse" radiusX={490} radiusY={190} rotation={-8} duration={24} itemSize={112} responsive showPath pathColor="rgba(168,85,247,.32)" centerContent={<div className="mx-orbit-center"><img src="/logo_solo.png" alt="Qlix"/></div>}/></div></section>
    <section className="mx-section mx-proof"><div><Eyebrow>PROVABLE HISTORY</Eyebrow><h2>Actions leave evidence.</h2></div><div><p>Configured Qlix events are recorded and signed using Ed25519. Once recorded, a Qlix audit entry is cryptographically impossible to modify.</p><div className="mx-signature"><span>EVENT / 04F8-A21C</span><span>ED25519 / VERIFIED</span><span>ENTRY / IMMUTABLE</span></div></div></section>
    <section className="mx-business-banner"><Eyebrow>QLIX FOR BUSINESS</Eyebrow><h2>Your operation is unique.<br/>Your Qlix can be too.</h2><p>Exora designs agents, workflows, and ongoing support around the way your business actually works.</p><Link className="mx-button mx-button-light" to="/solutions">Explore tailored solutions <Arrow /></Link></section>
  </main>;
}

export function QlixPage() {
  return <main><PageHero eyebrow="THE PRODUCT" title={<>Build agents by<br/><em>describing the work.</em></>} text="Qlix is a no-code platform for creating, connecting, governing, and reviewing AI agents through natural language." action="Open Qlix" href="https://qlix.exora.solutions" />
    <section className="mx-showcase mx-page-showcase"><ProductConsole /></section>
    <section className="mx-section"><div className="mx-section-head"><Eyebrow>ONE OPERATING LOOP</Eyebrow><h2>Build. Connect.<br/>Control. Improve.</h2></div><div className="mx-feature-grid"><Feature n="01" visual="language" title="Natural-language building" text="Describe the responsibility, instructions, and desired outcome without constructing code."/><Feature n="02" visual="connections" title="Tool connections" text="Connect Gmail, WhatsApp, Zoho, and Slack with access scoped to the workflow."/><Feature n="03" visual="control" title="Human control" text="Assign ownership, permission boundaries, and approval requirements for sensitive actions."/><Feature n="04" visual="review" title="Operational review" text="Inspect activity, outcomes, exceptions, and signed audit entries from configured events."/></div></section>
    <section className="mx-section mx-deploy"><div><Eyebrow>DEPLOYMENT</Eyebrow><h2>Your cloud.<br/>Your environment.</h2></div><div><p>Qlix can run as a cloud deployment or locally, depending on the operating and infrastructure requirements of the customer.</p><div className="mx-deploy-options"><span>CLOUD</span><i>OR</i><span>LOCAL</span></div></div></section>
    <section className="mx-section"><div className="mx-section-head"><Eyebrow>LIVE CONNECTIONS</Eyebrow><h2>The channels already<br/>inside your day.</h2></div><div className="mx-logo-row">{liveIntegrations.map(x=><div key={x}><b>{x.slice(0,1)}</b><span>{x}</span></div>)}</div></section>
    <section className="mx-roadmap"><span>ON THE HORIZON</span><h2>AI employees</h2><p>A future direction for persistent, role-oriented agents that operate as part of a team. Roadmap—not a currently available Qlix feature.</p></section>
    <FinalCta title="Create your first Qlix agent." />
  </main>;
}

export function SolutionsPage() {
  return <main><PageHero eyebrow="QLIX FOR BUSINESS" title={<>The product,<br/><em>shaped around you.</em></>} text="Businesses get Qlix plus agent design, tailored workflows, and hands-on support from Exora." action="Discuss your workflow" to="/contact" />
    <section className="mx-section"><div className="mx-section-head"><Eyebrow>THE ENGAGEMENT</Eyebrow><h2>Product foundation.<br/>Personalized operation.</h2></div><div className="mx-feature-grid mx-three"><Feature n="01" visual="agent" title="Agent design" text="We translate a business responsibility into clear agent instructions, access boundaries, and escalation logic."/><Feature n="02" visual="workflow" title="Workflow design" text="We connect people, Qlix agents, and business tools into an operating flow that fits the organisation."/><Feature n="03" visual="support" title="Ongoing support" text="We help teams review behaviour, refine workflows, and expand their Qlix environment responsibly."/></div></section>
    <section className="mx-section mx-process"><div><Eyebrow>WORKING TOGETHER</Eyebrow><h2>One useful workflow.<br/>Then the next.</h2></div><ol>{['Discover the operational job','Design the agent and controls','Connect and validate the workflow','Launch, support, and improve'].map((x,i)=><li key={x}><span>0{i+1}</span><h3>{x}</h3></li>)}</ol></section>
    <section className="mx-section"><div className="mx-section-head"><Eyebrow>EXAMPLE CAPABILITIES</Eyebrow><h2>A Qlix for the work<br/>behind your business.</h2></div><div className="mx-agent-cards">{agentCapabilities.map(a=><Link key={a.slug} to={`/agents/${a.slug}`}><span>{a.index}</span><h3>{a.title}</h3><p>{a.short}</p><b>View capability ↗</b></Link>)}</div></section>
    <FinalCta title="Bring us the workflow that keeps slowing you down." />
  </main>;
}

export function AboutPage() {
  return <main><PageHero eyebrow="ABOUT EXORA" title={<>We build the product<br/><em>that builds agents.</em></>} text="Exora is a product company creating Qlix: a governed, accessible way for individuals and startups to put AI agents to work." action="Explore Qlix" to="/qlix" />
    <section className="mx-section mx-manifesto"><Eyebrow>OUR POINT OF VIEW</Eyebrow><p>AI should not remain trapped in chat windows. It should be able to take responsibility for real work—without asking people to surrender visibility or control.</p></section>
    <section className="mx-section"><div className="mx-section-head"><Eyebrow>WHAT WE BELIEVE</Eyebrow><h2>Capability earns attention.<br/>Control earns trust.</h2></div><div className="mx-feature-grid mx-three"><Feature n="01" title="People stay responsible" text="Every operational agent should have clear human ownership and escalation paths."/><Feature n="02" title="Building should feel natural" text="People should be able to describe useful work without first becoming software engineers."/><Feature n="03" title="History should be provable" text="Recorded operational evidence should not be quietly rewritten after the fact."/></div></section>
    <section className="mx-section mx-company-line"><span>EXORA</span><i>BUILDS</i><span>QLIX</span><i>SO YOU CAN BUILD</i><span>AGENTS</span></section>
    <FinalCta title="See what you can build with Qlix." />
  </main>;
}

export function CareersPage() { return <main><PageHero eyebrow="CAREERS" title={<>Help make AI agents<br/><em>useful in the real world.</em></>} text="We are building Qlix at the intersection of AI, product design, distributed systems, and human control." action="Contact us" href="mailto:support@exora.solutions" />
    <section className="mx-section mx-careers"><div><Eyebrow>WORK AT EXORA</Eyebrow><h2>Small team.<br/>Large product surface.</h2></div><div><p>We value people who can move between first principles and shipped details. People who care about what an agent can do—and what it should be allowed to do.</p><div className="mx-values"><span>PRODUCT THINKING</span><span>TECHNICAL CRAFT</span><span>RESPONSIBLE AUTONOMY</span><span>CLEAR COMMUNICATION</span></div></div></section>
    <section className="mx-open-role"><span>OPEN APPLICATION</span><h2>Don’t see a role listed?</h2><p>Tell us what you are exceptional at and why Qlix is the product you want to help build.</p><a className="mx-button mx-button-light" href="mailto:support@exora.solutions?subject=Working%20at%20Exora">Write to us <Arrow /></a></section>
  </main>; }

export function ContactPage() { return <main><PageHero eyebrow="CONTACT" title={<>Bring us the work<br/><em>you want agents to own.</em></>} text="Whether you want to create your own Qlix agents or shape a tailored business deployment, start the conversation here." action="Email Exora" href="mailto:support@exora.solutions" />
    <section className="mx-section mx-contact-grid"><div><Eyebrow>GET IN TOUCH</Eyebrow><a className="mx-email" href="mailto:support@exora.solutions">support@exora.solutions <Arrow /></a><p>Tell us about the workflow, the people involved, and the systems it touches. We will help identify the right starting point.</p></div><div className="mx-contact-card"><span>GOOD FIRST MESSAGE</span><ol><li>What outcome do you want?</li><li>Which tools are involved?</li><li>What must stay under human approval?</li><li>Cloud or local preference?</li></ol></div></section>
  </main>; }

export function AgentPage() {
  const { slug } = useParams(); const agent=agentCapabilities.find(x=>x.slug===slug); if(!agent)return <Navigate to="/solutions" replace/>;
  return <main><PageHero eyebrow={`QLIX CAPABILITY / ${agent.index}`} title={<>{agent.title}<br/><em>agent.</em></>} text={agent.short} action="Design this workflow" to="/contact" />
    <section className="mx-section mx-agent-detail"><div><Eyebrow>ILLUSTRATIVE WORKFLOW</Eyebrow><h2>{agent.signal.split(' · ').join('. ')}.</h2></div><div className="mx-agent-pipeline"><span>01 / INPUT</span><i>↓</i><span>02 / QLIX INSTRUCTION</span><i>↓</i><span>03 / POLICY & APPROVAL</span><i>↓</i><span>04 / ACTION</span><i>↓</i><span>05 / SIGNED RECORD</span></div></section>
    <section className="mx-section"><div className="mx-section-head"><Eyebrow>CONTROL MODEL</Eyebrow><h2>Controls shaped for<br/><em>{agent.title.toLowerCase()}.</em></h2></div><div className="mx-feature-grid mx-three mx-control-grid">{agent.controls.map((control,i)=><article className="mx-feature mx-control-feature" key={control.title}><span>{String.fromCharCode(65+i)}</span><ControlVisual type={control.visual}/><h3>{control.title}</h3><p>{control.text}</p></article>)}</div></section><FinalCta title={`Shape a ${agent.title.toLowerCase()} around your operation.`}/>
  </main>;
}

function PageHero({eyebrow,title,text,action,to,href}) { const button=<>{action} <Arrow /></>; return <section className="mx-hero mx-page-hero"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p className="mx-lede">{text}</p>{to?<Link className="mx-button mx-button-light" to={to}>{button}</Link>:<a className="mx-button mx-button-light" href={href}>{button}</a>}</section>; }
function Feature({n,title,text,visual}) { return <article className={`mx-feature${visual?' mx-visual-feature':''}`}><span>{n}</span>{visual&&<FeatureVisual type={visual}/>}<h3>{title}</h3><p>{text}</p></article>; }
function FinalCta({title}) { return <section className="mx-final"><img src="/logo_solo.png" alt=""/><Eyebrow>YOUR NEXT AGENT</Eyebrow><h2>{title}</h2><CtaPair /></section>; }
