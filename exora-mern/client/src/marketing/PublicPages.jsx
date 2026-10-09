import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Blobatar } from '@blobatar/react';
import { useGaze } from '@blobatar/react/gaze';
import { happy, thinking, smug, surprised } from 'blobatar/expression';
import 'blobatar/motion.css';
import 'blobatar/gaze.css';
import { API_BASE_URL } from '../config/api';
import {
  SiAsana,
  SiDiscord,
  SiDropbox,
  SiGithub,
  SiGmail,
  SiGooglecalendar,
  SiGoogledocs,
  SiGoogledrive,
  SiGoogleforms,
  SiGooglemeet,
  SiGooglesheets,
  SiHubspot,
  SiJira,
  SiNotion,
  SiSlack,
  SiTelegram,
  SiTrello,
  SiWhatsapp,
  SiZoom,
  SiZoho,
} from 'react-icons/si';
import { FiEdit3, FiGitBranch, FiShield, FiTrendingUp } from 'react-icons/fi';
// import DinoWanderer from '../components/DinoWanderer';
import { agentCapabilities, liveIntegrations, steps } from './content';

const Arrow = ({ className = '' }) => (
  <svg className={`mx-arrow-icon ${className}`.trim()} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 12L12 4M12 4H6.5M12 4V9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Eyebrow = ({ children }) => <div className="mx-eyebrow"><i />{children}</div>;
const CtaPair = () => <div className="mx-actions"><Link className="mx-button mx-button-light" to="/contact">Start a conversation <Arrow /></Link><a className="mx-button mx-button-ghost" href="https://qlix.exora.solutions">Open Qlix <Arrow /></a></div>;

const TOOL_ROW_ONE = [
  { icon: SiGmail, label: 'Gmail', color: '#ea4335' },
  { icon: SiSlack, label: 'Slack', color: '#4a154b' },
  { icon: SiWhatsapp, label: 'WhatsApp', color: '#25d366' },
  { icon: SiZoho, label: 'Zoho', color: '#e42527' },
  { icon: SiGooglecalendar, label: 'Google Calendar', color: '#4285f4' },
  { icon: SiGooglesheets, label: 'Google Sheets', color: '#0f9d58' },
  { icon: SiGoogledrive, label: 'Google Drive', color: '#fbbc04' },
];

const TOOL_ROW_TWO = [
  { icon: SiNotion, label: 'Notion', color: '#111111' },
  { icon: SiGithub, label: 'GitHub', color: '#181717' },
  { icon: SiHubspot, label: 'HubSpot', color: '#ff7a59' },
  { icon: SiDiscord, label: 'Discord', color: '#5865f2' },
  { icon: SiTelegram, label: 'Telegram', color: '#26a5e4' },
  { icon: SiTrello, label: 'Trello', color: '#0052cc' },
  { icon: SiAsana, label: 'Asana', color: '#f06a6a' },
  { icon: SiZoom, label: 'Zoom', color: '#2d8cff' },
  { icon: SiDropbox, label: 'Dropbox', color: '#0061ff' },
  { icon: SiJira, label: 'Jira', color: '#2684ff' },
];

const GOOGLE_SERVICES = [
  { icon: SiGmail, label: 'Gmail', color: '#EA4335' },
  { icon: SiGoogledrive, label: 'Drive', color: '#0F9D58' },
  { icon: SiGooglecalendar, label: 'Calendar', color: '#4285F4' },
  { icon: SiGoogledocs, label: 'Docs', color: '#4285F4' },
  { icon: SiGooglesheets, label: 'Sheets', color: '#0F9D58' },
  { icon: SiGooglemeet, label: 'Meet', color: '#00AC47' },
  { icon: SiGoogleforms, label: 'Forms', color: '#7248B9' },
];

const QLIX_CONNECTED_TOOLS = [
  { label: 'Google Workspace', services: GOOGLE_SERVICES, color: '#4285F4' },
  { icon: SiSlack, label: 'Slack', color: '#4A154B' },
  { icon: SiWhatsapp, label: 'WhatsApp', color: '#25D366' },
  { icon: SiNotion, label: 'Notion', color: '#111111' },
  { icon: SiJira, label: 'Jira', color: '#2684FF' },
  { icon: SiHubspot, label: 'HubSpot', color: '#FF7A59' },
  { icon: SiGithub, label: 'GitHub', color: '#181717' },
  { icon: SiZoom, label: 'Zoom', color: '#2D8CFF' },
  { icon: SiDropbox, label: 'Dropbox', color: '#0061FF' },
];

const QLIX_WORKFLOW_STEPS = [
  { n: '01', title: 'Build', text: 'Describe the responsibility and the outcome.', icon: FiEdit3 },
  { n: '02', title: 'Connect', text: 'Choose the files, tools and services it can use.', icon: FiGitBranch },
  { n: '03', title: 'Control', text: 'Approve sensitive actions and define clear limits.', icon: FiShield },
  { n: '04', title: 'Improve', text: 'Review conversations and make the agent better.', icon: FiTrendingUp },
];

function ToolMarquee({ tools, reverse = false, duration = 32 }) {
  const loop = [...tools, ...tools];
  return (
    <div className={`mx-tool-marquee${reverse ? ' is-reverse' : ''}`} style={{ '--mx-marquee-duration': `${duration}s` }}>
      <div className="mx-tool-marquee-track">
        {loop.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <div className="mx-tool-chip" key={`${tool.label}-${index}`} aria-hidden={index >= tools.length || undefined}>
              <span className="mx-tool-chip-icon" style={{ color: tool.color }}>
                <Icon aria-hidden />
              </span>
              <span className="mx-tool-chip-label">{tool.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
    <div className="mx-console-grid"><aside><span>BUILD</span><b>Instruction</b><b>Knowledge</b><b>Connections</b><span>CONTROL</span><b>Permissions</b><b>Approvals</b><b>Audit</b></aside><div className="mx-prompt"><span>NATURAL LANGUAGE BUILDER</span><h3>What should your agent do?</h3><div className="mx-input">Monitor our support inbox, answer from approved knowledge, and send uncertain cases to a person.<i><Arrow /></i></div><div className="mx-chips"><span>Gmail connected</span><span>Human approval</span><span>Audit enabled</span></div><div className="mx-flow"><b>INBOX</b><i>→</i><b>QLIX AGENT</b><i>→</i><b>REVIEW</b></div></div></div>
    <div className="mx-console-foot"><span>Illustrative interface</span><span>ED25519 SIGNING · ACTIVE</span></div>
  </div>;
}

const catalogueGroups = [
  { n: '01', title: 'Find the leverage', text: 'See where work slows down, where information breaks apart, and where intelligent systems can create the clearest return.', items: ['AI readiness', 'Process mapping', 'Transformation strategy'] },
  { n: '02', title: 'Build the product', text: 'Turn the right opportunity into software people actually want to use—from internal tools to customer platforms.', items: ['Custom platforms', 'Internal tools', 'Digital products'] },
  { n: '03', title: 'Put work in motion', text: 'Give repetitive work to governed agents and automations, with people kept in control of every sensitive decision.', items: ['AI agents', 'Workflow automation', 'CRM systems'] },
  { n: '04', title: 'Connect the business', text: 'Make your existing tools, data and teams behave like one system instead of a collection of disconnected parts.', items: ['API development', 'System integrations', 'Data pipelines'] },
  { n: '05', title: 'Keep it running', text: 'Operate on dependable infrastructure with the security, visibility and technical ownership needed after launch.', items: ['Cloud infrastructure', 'Security', 'Managed operations'] },
  { n: '06', title: 'Make it compound', text: 'Use operational data to improve decisions, refine the system and unlock the next valuable layer of transformation.', items: ['Analytics', 'Business intelligence', 'Optimisation'] },
];

const useCases = ['Sales & CRM', 'Customer support', 'Finance & admin', 'Operations', 'Inventory', 'Compliance', 'Knowledge', 'Reporting'];

function ExoraMark() {
  return <div className="exora-mark" aria-hidden="true"><i/><i/><i/><i/><i/><i/><span/></div>;
}

const blobExpressions = [happy, thinking, smug, surprised, happy];

function AgentBlob({ name, index }) {
  const { ref } = useGaze({ travel: 3.2, lookAt: 'pointer' });
  return <Blobatar ref={ref} name={name} expression={blobExpressions[index % blobExpressions.length]} animate="always" size={170} className={`ql-blob ql-blob-${index + 1}`} alt={`${name} agent`} />;
}

export function HomePage() {
  return <main className="ql-home">
    {/* <DinoWanderer /> */}
    <section className="ql-hero">
      <div className="ql-hero-brandmark"><img src="/logo_solo.png" alt="Exora" /></div>
      <div className="ql-hero-topline"><span>QLIX DESKTOP / PERSONAL AI SYSTEM</span><span>BUILT BY EXORA</span></div>
      <div className="ql-hero-copy ql-hero-copy-minimal"><div className="ql-hero-intro"><h1><span className="ql-hero-line">DON’T JUST CHAT</span><br/><span className="ql-hero-line">WITH AI. <em>PUT IT</em></span><br/><em className="ql-hero-line">TO WORK.</em></h1><a className="mx-button mx-button-dark" href="https://qlix.exora.solutions/download">Download Qlix <Arrow/></a></div><div className="ql-hero-video"><video src="/qlix-ad.mp4" autoPlay loop muted playsInline controls controlsList="nodownload" preload="metadata" aria-label="Qlix desktop app demonstration"/></div></div>
      <div className="ql-hero-visual" aria-label="Qlix desktop application preview"><div className="ql-window"><div className="ql-window-bar"><i/><i/><i/><span>Qlix</span><b>DESKTOP</b></div><div className="ql-window-body"><aside><img src="/qlix-dino.png" alt=""/><strong>QLIX</strong><nav><span className="active">Overview</span><span>Agents</span><span>Conversations</span><span>Connections</span><span>Templates</span></nav><small>PRIVATE WORKSPACE</small></aside><div className="ql-dashboard"><span className="ql-mini-label">OVERVIEW</span><h2>Your workspace is ready.</h2><p>Your agents, conversations and connected apps live here.</p><div className="ql-stats"><article><span>AGENTS</span><b>01</b><small>1 ready</small></article><article><span>ACTIVITY</span><b>READY</b><small>Open a conversation</small></article><article><span>CONNECTIONS</span><b>OPTIONAL</b><small>Add them when you want</small></article></div><div className="ql-task-card"><img src="/qlix-dino.png" alt="Qlix dinosaur assistant"/><div><span>DESKTOP ASSISTANT</span><b>What would you like to get done?</b><small>Private workspace · asks before acting</small></div><button aria-label="Open assistant">↗</button></div></div></div></div><span className="ql-float-note note-a">BUILD AGENTS</span><span className="ql-float-note note-b">CONNECT YOUR TOOLS</span><span className="ql-float-note note-c">KEEP CONTROL</span></div>
    </section>

    <section className="ql-assistant" id="assistant">
      <div className="ql-section-heading"><div className="ex-section-label"><span>01</span> INCLUDED WITH QLIX</div><h2>DOWNLOAD QLIX.<br/>YOUR ASSISTANT<br/><em>ARRIVES READY.</em></h2><p>Every installation includes a desktop assistant that starts in its own private workspace. Add folders, apps and connected accounts only when you choose.</p></div>
      <div className="ql-assistant-stage"><div className="ql-desktop-bg"><div className="ql-menu-bar"><span>● ● ●</span><b>10:42</b></div><div className="ql-folder one">PROJECTS</div><div className="ql-folder two">REPORTS</div><div className="ql-companion"><div className="ql-chat-bubble"><span>QLIX ASSISTANT</span><b>Ready when you are.</b><p>Ask a question, open a file or start a task.</p><div>Message your assistant <i>↑</i></div></div></div></div></div>
      <div className="ql-assistant-points">{[['01','Always within reach','Open your assistant beside the work already on your screen.'],['02','Connected when you choose','Add selected folders, email, calendars and other services.'],['03','More than conversation','Ask questions, organise work and launch actions from one place.'],['04','Permission before action','Qlix asks before sensitive computer actions and account changes.']].map(([n,title,text])=><article key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <section className="ql-distinction ql-agents-showcase"><div><span className="ex-kicker">YOUR AI WORKFORCE</span><h2>BUILD A TEAM<br/>THAT KEEPS<br/><em>WORK MOVING.</em></h2></div><div className="ql-role-cards is-agent-only"><article className="ql-agents-card"><div className="ql-blob-team">{['Research','Operations','Support','Finance','Growth'].map((name,index)=><AgentBlob name={name} index={index} key={name}/>)}</div><span>PERSISTENT</span><h3>Your agents</h3><p>Create focused agents with responsibilities, tools, boundaries and their own workspace. Move your cursor—the team is paying attention.</p></article></div></section>

    <section className="ql-loop"><div className="ql-section-heading"><div className="ex-section-label"><span>02</span> FROM IDEA TO ACTION</div><h2>BUILD. CONNECT.<br/>CONTROL. <em>IMPROVE.</em></h2><p>Describe the work in everyday language. Qlix gives the agent a workspace, then lets you add only the access it needs.</p></div><ol>{QLIX_WORKFLOW_STEPS.map(({n,title,text,icon:Icon})=><li key={n}><span>{n}</span><div className="ql-topic-icon" aria-hidden="true"><Icon/></div><h3>{title}</h3><p>{text}</p></li>)}</ol></section>

    <section className="ql-tools"><div><span className="ex-kicker">OPTIONAL CONNECTIONS</span><h2>YOUR TOOLS.<br/>ON YOUR TERMS.</h2><p>Connect the services your agents need. Keep everything else private.</p></div><div className="ql-real-tools">{QLIX_CONNECTED_TOOLS.map(tool=>{const Icon=tool.icon;return <div className={`ql-real-tool${tool.services?' is-google':''}`} key={tool.label}>{tool.services?<div className="ql-google-services">{tool.services.map(service=>{const ServiceIcon=service.icon;return <span key={service.label} style={{color:service.color}} title={service.label}><ServiceIcon aria-hidden/></span>})}</div>:<span style={{color:tool.color}}><Icon aria-hidden/></span>}<b>{tool.label}</b></div>})}</div></section>

    <section className="ql-b2b-film" aria-label="Exora business systems film"><video src="/exora-b2b.mp4" autoPlay loop muted playsInline controls controlsList="nodownload" preload="metadata" /></section>

    <section className="ql-enterprise"><div><span>BUILT FOR COMPLETE OPERATIONS</span><h2>QLIX FOR<br/>BUSINESS.</h2></div><div><div className="ql-enterprise-motif"><i/><i/><i/><i/></div><h3>One assistant becomes an operating system.</h3><p>Exora designs the agents, software and integrations behind complete business operations.</p><div className="mx-actions"><Link className="mx-button mx-button-light" to="/master-catalogue">Explore the Master Catalogue <Arrow/></Link><Link className="mx-text-link is-light" to="/contact">Talk to Exora <Arrow/></Link></div></div></section>

    <section className="ql-final"><img src="/qlix-dino.png" alt="Qlix dinosaur"/><span>QLIX DESKTOP</span><h2>YOUR NEXT TASK<br/>IS AN INSTRUCTION<br/><em>AWAY.</em></h2><a className="mx-button mx-button-dark" href="https://qlix.exora.solutions/download">Download Qlix <Arrow/></a></section>
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
  return <main className="ex-editorial-page ex-business-page">
    <section className="ex-editorial-hero"><div className="ql-hero-brandmark"><img src="/logo_solo.png" alt="Exora" /></div><div className="ql-hero-topline"><span>EXORA / BUSINESS SYSTEMS</span><span>QLIX · AGENTS · AUTOMATION</span></div><div className="ex-editorial-hero-grid"><div className="ex-editorial-hero-copy"><span className="ex-kicker">QLIX FOR BUSINESS</span><h1>TURN AI<br/>INTO AN<br/><em>OPERATION.</em></h1><p>We design the agents, workflows and controls that move important work across your business—without losing human ownership.</p><Link className="mx-button mx-button-dark" to="/contact">Discuss your workflow <Arrow/></Link></div><div className="ex-system-panel" aria-hidden="true"><span>BUSINESS SYSTEM / LIVE</span><div className="ex-system-core">QLIX</div>{['YOUR TEAM','AI AGENTS','BUSINESS TOOLS','APPROVALS'].map((x,i)=><i style={{'--i':i}} key={x}>{x}</i>)}</div></div><div className="ex-editorial-principles"><span>DESIGNED AROUND THE WORK</span><span>CONTROLLED BY YOUR PEOPLE</span><span>IMPROVED WITH EVIDENCE</span></div></section>
    <section className="ex-editorial-statement"><span className="ex-kicker">FROM DEMO TO DAILY WORK</span><h2>AN AGENT IS ONLY USEFUL<br/>WHEN THE BUSINESS<br/><em>CAN RELY ON IT.</em></h2><p>Qlix gives every agent a defined responsibility, the tools it needs, boundaries it cannot cross, and a clear route back to a person.</p></section>
    <section className="ex-editorial-section"><div className="ex-section-intro"><div className="ex-section-label"><span>01</span> WHAT WE DESIGN</div><h2>ONE WORKFLOW.<br/>EVERY NECESSARY<br/><em>CONTROL.</em></h2><p>We begin with the operational job—not the technology—and shape the agent, connections and governance around the outcome.</p></div><div className="ex-editorial-card-grid">{[['01','Agent responsibility','A precise job, success criteria, instructions and escalation path.'],['02','Connected workflow','The right people, tools and data joined into one deliberate flow.'],['03','Human control','Permissions, approval points and visible ownership for sensitive actions.'],['04','Operational review','A clear record of outcomes, exceptions and opportunities to improve.']].map(([n,title,text])=><article key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="ex-catalogue-journey ex-business-journey"><div className="ex-section-label"><span>02</span> HOW WE LAUNCH</div><div className="ex-catalogue-journey-head"><h2>PROVE VALUE.<br/><em>THEN EXPAND.</em></h2><p>Start with a meaningful workflow, make it dependable, and grow the system only when the evidence supports the next step.</p></div><ol>{['Discover the operational job','Design the agent and controls','Connect and validate the workflow','Launch, review and improve'].map((x,i)=><li key={x}><span>0{i+1}</span><h3>{x}</h3></li>)}</ol></section>
    <section className="ex-editorial-section ex-capability-links"><div className="ex-section-intro"><div className="ex-section-label"><span>03</span> EXAMPLE CAPABILITIES</div><h2>THE WORK BEHIND<br/>YOUR BUSINESS,<br/><em>MADE OPERABLE.</em></h2><p>Explore common starting points, then shape the final system around the way your organisation actually works.</p></div><div className="mx-agent-cards">{agentCapabilities.map(a=><Link key={a.slug} to={`/agents/${a.slug}`}><span>{a.index}</span><h3>{a.title}</h3><p>{a.short}</p><b>View capability <Arrow /></b></Link>)}</div></section>
    <section className="ex-final-cta"><span>START WITH THE WORK THAT KEEPS SLOWING DOWN</span><h2>ONE USEFUL WORKFLOW.<br/>BUILT TO BECOME<br/>A BETTER SYSTEM.</h2><div className="mx-actions"><Link className="mx-button mx-button-light" to="/contact">Talk to Exora <Arrow/></Link></div></section>
  </main>;
}

export function MasterCataloguePage() {
  return <main className="ex-catalogue-page">
    <section className="ex-catalogue-hero">
      <div className="ql-hero-brandmark"><img src="/logo_solo.png" alt="Exora" /></div>
      <div className="ql-hero-topline"><span>EXORA / MASTER CATALOGUE</span><span>STRATEGY · SOFTWARE · AI · OPERATIONS</span></div>
      <div className="ex-catalogue-hero-grid">
        <div className="ex-catalogue-hero-copy"><span className="ex-kicker">YOUR BUSINESS, CONNECTED END TO END</span><h1>DON’T BUY<br/>MORE TOOLS.<br/><em>BUILD ONE SYSTEM<br/>FOR EVERYTHING</em></h1><p>Exora turns scattered processes, software and AI ideas into one practical operating system for your business.</p><Link className="mx-button mx-button-dark" to="/contact">Start with your business problem <Arrow/></Link></div>
        <div className="ex-catalogue-film"><video src="/exora-vid3.mp4" autoPlay loop muted playsInline controls controlsList="nodownload" preload="metadata" aria-label="Exora business transformation film"/></div>
      </div>
      <div className="ex-catalogue-principles"><span>ONE STRATEGY</span><span>ONE CONNECTED BUILD</span><span>ONE ACCOUNTABLE PARTNER</span></div>
    </section>

    <section className="ex-catalogue-statement"><span className="ex-kicker">THE MASTER CATALOGUE</span><h2>EVERY CAPABILITY YOU NEED.<br/><em>NONE OF THE FRAGMENTATION.</em></h2><p>Most transformation fails between the gaps: strategy ends before delivery, software ships without adoption, and automation grows without ownership. We join those pieces into one working system.</p></section>

    <section className="ex-catalogue ex-catalogue-index"><div className="ex-section-intro"><div className="ex-section-label"><span>01</span> THE OPERATING SYSTEM</div><h2>START WITH THE<br/>BOTTLENECK.<br/><em>EXPAND WITH PROOF.</em></h2><p>You do not need to choose a service from a menu. Bring us the outcome that matters; we will assemble the strategy, product, automation and infrastructure required to deliver it.</p></div><div className="ex-catalogue-grid">{catalogueGroups.map(group=><article className="ex-service-card" key={group.n}><span>{group.n}</span><h3>{group.title}</h3><p>{group.text}</p><ul>{group.items.map(item=><li key={item}>{item}</li>)}</ul><Link to="/contact">Explore this layer <Arrow/></Link></article>)}</div></section>

    <section className="ex-catalogue-journey"><div className="ex-section-label"><span>02</span> FROM PROBLEM TO OPERATION</div><div className="ex-catalogue-journey-head"><h2>ONE CONTINUOUS<br/><em>DELIVERY LOOP.</em></h2><p>We stay close enough to understand the work, technical enough to build the system, and accountable enough to improve what happens after launch.</p></div><ol>{[['01','Understand','Map the work, systems, constraints and commercial outcome.'],['02','Design','Shape the smallest connected system capable of creating real value.'],['03','Deliver','Build, integrate and launch with the people who will use it.'],['04','Compound','Measure what changed, improve the operation and expand deliberately.']].map(([n,title,text])=><li key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></li>)}</ol></section>

    <section className="ex-engagement"><div><span className="ex-kicker">HOW WE CAN WORK TOGETHER</span><h2>START PRECISELY.<br/>BUILD CONFIDENTLY.<br/><em>STAY CONNECTED.</em></h2><p className="ex-engagement-lede">Choose the level of partnership that fits the ambition. Every engagement is designed around a measurable business outcome—not a predetermined stack.</p></div><div>{['Focused build','Transformation programme','Managed technology partner'].map((item,index)=><article key={item}><span>0{index+1}</span><h3>{item}</h3><p>{index===0?'A defined product, workflow or integration taken from clear brief to working launch.':index===1?'A sequenced transformation across processes, platforms, data and the teams that operate them.':'Long-term technical ownership for the systems that run the business, with continuous support and improvement.'}</p></article>)}</div></section>

    <section className="ex-final-cta"><span>YOU DO NOT NEED A PERFECT BRIEF</span><h2>BRING THE FRICTION.<br/>WE’LL DESIGN<br/>WHAT COMES NEXT.</h2><p>Tell us where work gets stuck, what growth is demanding, or which systems refuse to work together.</p><div className="mx-actions"><Link className="mx-button mx-button-light" to="/contact">Start a conversation <Arrow/></Link></div></section>
  </main>;
}

export function AboutPage() {
  return <main className="ex-editorial-page ex-about-page">
    <section className="ex-editorial-hero"><div className="ql-hero-brandmark"><img src="/logo_solo.png" alt="Exora" /></div><div className="ql-hero-topline"><span>EXORA / ABOUT</span><span>PRODUCT · SYSTEMS · RESPONSIBLE AI</span></div><div className="ex-editorial-hero-grid"><div className="ex-editorial-hero-copy"><span className="ex-kicker">WE BUILD FOR WORK, NOT THE HYPE CYCLE</span><h1>AI SHOULD<br/>DO MORE<br/><em>THAN TALK.</em></h1><p>Exora is the company behind Qlix. We build intelligent products and connected business systems that turn instructions into accountable action.</p><Link className="mx-button mx-button-dark" to="/qlix">Meet Qlix <Arrow/></Link></div><div className="ex-about-mark"><ExoraMark/><span>EXORA / BUILT FOR RESPONSIBLE AUTONOMY</span></div></div><div className="ex-editorial-principles"><span>USEFUL BY DESIGN</span><span>HUMANLY ACCOUNTABLE</span><span>BUILT TO KEEP IMPROVING</span></div></section>
    <section className="ex-editorial-statement"><span className="ex-kicker">OUR POINT OF VIEW</span><h2>CAPABILITY EARNS ATTENTION.<br/><em>CONTROL EARNS TRUST.</em></h2><p>AI becomes valuable when it can take responsibility for real work. It becomes dependable when people can see, shape and govern what it does.</p></section>
    <section className="ex-editorial-section"><div className="ex-section-intro"><div className="ex-section-label"><span>01</span> WHAT WE BELIEVE</div><h2>BUILD THE POWER.<br/>KEEP THE PERSON<br/><em>IN THE LOOP.</em></h2><p>Our products are built around a simple idea: autonomy and accountability should advance together.</p></div><div className="ex-editorial-card-grid ex-three">{[['01','People stay responsible','Every operational agent needs a named owner, defined limits and a route to human judgment.'],['02','Building should feel natural','Useful systems should begin with a clear description of the work—not a requirement to become a software engineer.'],['03','History should be provable','Important activity should leave evidence that can be reviewed, trusted and learned from.']].map(([n,title,text])=><article key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="ex-about-equation"><span>EXORA</span><i>BUILDS</i><span>QLIX</span><i>SO TEAMS CAN BUILD</i><span>AGENTS</span></section>
    <section className="ex-final-cta"><span>THE NEXT ERA OF SOFTWARE TAKES RESPONSIBILITY</span><h2>BUILD AGENTS<br/>YOUR BUSINESS<br/>CAN TRUST.</h2><div className="mx-actions"><Link className="mx-button mx-button-light" to="/qlix">Explore Qlix <Arrow/></Link></div></section>
  </main>;
}

export function CareersPage() { return <main><PageHero eyebrow="CAREERS" title={<>Help make AI agents<br/><em>useful in the real world.</em></>} text="We are building Qlix at the intersection of AI, product design, distributed systems, and human control." action="Contact us" href="mailto:support@exora.solutions" />
    <section className="mx-section mx-careers"><div><Eyebrow>WORK AT EXORA</Eyebrow><h2>Small team.<br/>Large product surface.</h2></div><div><p>We value people who can move between first principles and shipped details. People who care about what an agent can do—and what it should be allowed to do.</p><div className="mx-values"><span>PRODUCT THINKING</span><span>TECHNICAL CRAFT</span><span>RESPONSIBLE AUTONOMY</span><span>CLEAR COMMUNICATION</span></div></div></section>
    <section className="mx-open-role"><span>OPEN APPLICATION</span><h2>Don’t see a role listed?</h2><p>Tell us what you are exceptional at and why Qlix is the product you want to help build.</p><a className="mx-button mx-button-light" href="mailto:support@exora.solutions?subject=Working%20at%20Exora">Write to us <Arrow /></a></section>
  </main>; }

const CONTACT_FAQ = [
  {
    q: 'How does governance work in Qlix?',
    a: 'Governance means every agent runs with clear ownership, permission boundaries, and review. Configured events can be recorded and signed with Ed25519 so operational history stays verifiable—not quietly rewritten. Policies define what an agent may do, what it must escalate, and who is accountable.',
  },
  {
    q: 'How do integrations and tool access work?',
    a: 'Qlix connects to tools you already use—Gmail, WhatsApp, Slack, Zoho, Sheets, Drive, and more—through scoped credentials. Agents only receive the access required for the workflow you configure, not open-ended control of every system.',
  },
  {
    q: 'Where does human control stay in the loop?',
    a: 'Sensitive actions can require named human approval before they execute—sending customer replies, placing purchases, changing records, or crossing a risk threshold. You decide which steps may run autonomously and which must wait for a person.',
  },
  {
    q: 'Can we deploy in the cloud or locally?',
    a: 'Both. Qlix can run as a managed cloud deployment or inside your own environment. Local and private deployments keep more of the runtime and customer data under your infrastructure controls. Tell us your preference when you reach out.',
  },
  {
    q: 'How is customer data retained and deleted?',
    a: 'We retain account and operational data while your subscription or deployment is active, then delete or anonymize eligible data after offboarding or a verified deletion request—subject to legal holds and any immutable audit records that must remain verifiable. Full detail is in our Privacy Policy.',
  },
  {
    q: 'Is customer data used for model training?',
    a: 'No—not by default. Customer content is processed to run your agents and is not used to train Exora or third-party foundation models unless you explicitly allow that in writing or via a documented opt-in. See Security and Privacy for the full stance.',
  },
];

function ContactFaq() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="mx-contact-card mx-contact-faq">
      <span>FAQS</span>
      <div className="mx-faq-list">
        {CONTACT_FAQ.map((item, index) => {
          const open = openIndex === index;
          return (
            <div className={`mx-faq-item${open ? ' is-open' : ''}`} key={item.q}>
              <button
                type="button"
                className="mx-faq-trigger"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? -1 : index)}
              >
                <span>{item.q}</span>
                <i aria-hidden>{open ? '−' : '+'}</i>
              </button>
              <div className="mx-faq-panel" hidden={!open}>
                <p>{item.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'contact_page' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send message. Please try again.');
      }
      setForm({ name: '', email: '', company: '', phone: '', message: '' });
      setStatus({
        type: 'success',
        message: data.message || 'Thanks — we received your message.',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Failed to send message. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="mx-contact-form" onSubmit={onSubmit} noValidate>
      <Eyebrow>SEND A MESSAGE</Eyebrow>
      <h2>Tell us what you want agents to do.</h2>

      <div className="mx-form-grid">
        <label className="mx-field">
          <span>Name *</span>
          <input name="name" type="text" autoComplete="name" value={form.name} onChange={onChange} required placeholder="Your name" />
        </label>
        <label className="mx-field">
          <span>Email *</span>
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} required placeholder="you@company.com" />
        </label>
        <label className="mx-field">
          <span>Company</span>
          <input name="company" type="text" autoComplete="organization" value={form.company} onChange={onChange} placeholder="Company name" />
        </label>
        <label className="mx-field">
          <span>Phone</span>
          <input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={onChange} placeholder="+91 ..." />
        </label>
      </div>

      <label className="mx-field mx-field-full">
        <span>Message *</span>
        <textarea
          name="message"
          rows={3}
          value={form.message}
          onChange={onChange}
          required
          placeholder="What outcome do you want, which tools are involved, and what should stay under human approval?"
        />
      </label>

      {status.message && (
        <div className={`mx-form-status is-${status.type}`} role="status">
          {status.message}
        </div>
      )}

      <button className="mx-button mx-button-light" type="submit" disabled={submitting}>
        {submitting ? 'Sending...' : <>Send message <Arrow /></>}
      </button>
    </form>
  );
}

export function ContactPage() {
  return (
    <main className="ex-editorial-page ex-contact-page">
      <section className="ex-contact-lead">
        <div className="ql-hero-brandmark"><img src="/logo_solo.png" alt="Exora" /></div>
        <div className="ql-hero-topline"><span>EXORA / CONTACT</span><span>BENGALURU · WORKING GLOBALLY</span></div>
        <div className="ex-contact-lead-grid">
          <div className="ex-contact-lead-copy">
            <span className="ex-kicker">YOU DO NOT NEED A PERFECT BRIEF</span>
            <h1>BRING US<br/>THE WORK<br/><em>THAT GETS STUCK.</em></h1>
            <p>Tell us what is slowing the business down, what you want an agent to own, or which systems need to work together. A short note is enough to begin.</p>
            <div className="ex-contact-direct">
              <a className="mx-email" href="mailto:support@exora.solutions">support@exora.solutions <Arrow /></a>
              <a
                className="mx-button mx-button-dark ex-whatsapp-btn"
                href="https://wa.me/918095404788"
                target="_blank"
                rel="noreferrer"
              >
                <SiWhatsapp aria-hidden /> WhatsApp <Arrow />
              </a>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <section className="ex-contact-details">
        <div>
          <span className="ex-kicker">DIRECT CONTACT</span>
          <h2>LET’S MAKE<br/>THE NEXT MOVE<br/><em>USEFUL.</em></h2>
          <ol className="ex-contact-steps">
            <li><b>01</b><p>Describe the outcome you need.</p></li>
            <li><b>02</b><p>Name the people and tools involved.</p></li>
            <li><b>03</b><p>Tell us what must stay under human control.</p></li>
          </ol>
          <div className="mx-trust-links">
            <Link to="/security">Security</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/security#report">Report a vulnerability</Link>
          </div>
        </div>
        <ContactFaq />
      </section>
    </main>
  );
}

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
