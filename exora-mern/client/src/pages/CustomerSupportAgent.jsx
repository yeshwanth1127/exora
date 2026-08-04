import { useEffect } from 'react';
import { MessageSquare, Inbox, BarChart3 } from "lucide-react";
import CardNav from '../components/CardNav';
import HowItWorks from '../components/HowItWorks';
import SeeHowItWorksButton from '../components/SeeHowItWorksButton';
import './InventoryProcurementAgent.css';
import '../components/Footer.css';

const STEPS = [
  { t: 'Customer Message', d: 'Incoming support requests from email, chat, or social media are captured instantly and processed by our natural language engine.' },
  { t: 'AI Reply', d: 'An instant, context-aware response is generated from your knowledge base, resolving up to 80% of common queries without human intervention.' },
  { t: 'Ticket Created', d: 'For complex issues, a ticket is automatically created in your CRM, categorized by intent and sentiment for priority routing.' },
  { t: 'Escalation', d: 'High-stake or nuanced issues are routed to the right human specialist with a full summary of the AI interaction to date.' },
  { t: 'Resolved', d: 'The ticket is closed, customer satisfaction is tracked, and the interaction data feeds back into the AI to improve future responses.' },
];

const WF_NODES = [
  <MessageSquare key="0" size={20} />,
  <Inbox key="1" size={20} />,
  <svg key="2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>,
  <svg key="3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 11l-5-5-5 5M17 18l-5-5-5 5"/></svg>,
  <svg key="4" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
];

const WF_LABELS = ['Customer Message', 'AI Reply', 'Ticket Created', 'Escalation', 'Resolved'];

const CARD_NAV_ITEMS = [
  { label: 'About', bgColor: '#0D0716', textColor: '#fff', links: [{ label: 'About', ariaLabel: 'About page', href: '/about' }, { label: 'Career', ariaLabel: 'Career info', href: '/career' }] },
  { label: 'Products', bgColor: '#170D27', textColor: '#fff', links: [{ label: 'Products', ariaLabel: 'Products page', href: '/products' }, { label: 'Solutions', ariaLabel: 'Solutions', href: '/solutions' }] },
  { label: 'Contact', bgColor: '#271E37', textColor: '#fff', links: [{ label: 'Contact', ariaLabel: 'Contact us', href: '/contact#contact' }] },
];

export default function CustomerSupportAgent() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <CardNav items={CARD_NAV_ITEMS} baseColor="rgba(255,255,255,0.08)" menuColor="#fff" buttonBgColor="rgba(17,17,17,0.75)" buttonTextColor="#fff" ease="power3.out" />

      <div className="relative z-10">
        <div className="pt-32 pb-16 md:pt-48 md:pb-32 flex items-center justify-center px-6">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-32 max-w-7xl w-full items-center">
            <div className="pr-4 text-center md:text-left flex flex-col items-center md:items-start max-w-[850px]">
              <h1 className="text-5xl md:text-6xl lg:text-[60px] font-extrabold leading-[1.1] mb-8 tracking-tight">Automate & Manage Customer Support in One Platform</h1>
              <p className="text-xl md:text-[20px] text-gray-400 mb-10 leading-relaxed">AI handles queries, tickets & escalations — so your team doesn't burn out.</p>
               <div className="flex gap-4 flex-wrap">
                <SeeHowItWorksButton />
              </div>
            </div>

            <div className="pl-0 md:pl-4">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-5 md:mb-6 pb-4 border-b border-white/10">
                  <h3 className="text-base md:text-lg font-semibold text-white">Support Dashboard</h3>
                  <div className="flex gap-1.5 md:gap-2">
                    <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>

                <div className="space-y-2.5 md:space-y-3">
                  <div className="bg-zinc-800/50 p-2.5 md:p-3 rounded-lg flex justify-between items-center hover:bg-zinc-700/50 transition">
                    <span className="text-gray-300 text-[13px] md:text-sm">Integration help needed</span>
                    <span className="px-2 md:px-3 py-1 bg-yellow-500/20 text-yellow-300 text-[10px] md:text-xs font-semibold rounded-full">Open</span>
                  </div>
                  <div className="bg-zinc-800/50 p-2.5 md:p-3 rounded-lg flex justify-between items-center hover:bg-zinc-700/50 transition">
                    <span className="text-gray-300 text-[13px] md:text-sm">Payment issue resolved</span>
                    <span className="px-2 md:px-3 py-1 bg-green-500/20 text-green-300 text-[10px] md:text-xs font-semibold rounded-full">Resolved</span>
                  </div>
                  <div className="bg-zinc-800/50 p-2.5 md:p-3 rounded-lg flex justify-between items-center hover:bg-zinc-700/50 transition">
                    <span className="text-gray-300 text-[13px] md:text-sm">API documentation request</span>
                    <span className="px-2 md:px-3 py-1 bg-blue-500/20 text-blue-300 text-[10px] md:text-xs font-semibold rounded-full">Pending</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="text-xs text-gray-400 font-semibold mb-3">Response Time (ms)</div>
                  <div className="flex items-end gap-2 h-20">
                    {[40, 65, 45, 75, 55].map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t opacity-80 ip-graph-bar" 
                        style={{ 
                          height: `${h}%`,
                          animationDelay: `${i * 0.12}s`,
                          animationDuration: `${3 + Math.random()}s`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section id="how-it-works" className="py-16 md:py-20 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-0">How It Works</h2>
            <HowItWorks 
              steps={STEPS.map((s, i) => ({ ...s, label: WF_LABELS[i], title: s.t, description: s.d }))}
              nodes={WF_NODES}
              themeColor="#a855f7"
            />
          </div>
        </section>

        <section className="py-16 md:py-20 px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center mb-6">
                  <MessageSquare size={24} className="text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">AI Auto Replies</h3>
                <p className="text-lg text-gray-400 font-medium leading-relaxed">Instantly respond to common questions with intelligent, context-aware replies.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center mb-6">
                  <Inbox size={24} className="text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Smart Ticketing</h3>
                <p className="text-lg text-gray-400 font-medium leading-relaxed">Automatically categorize, prioritize, and route tickets to the right team.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 size={24} className="text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Analytics Dashboard</h3>
                <p className="text-lg text-gray-400 font-medium leading-relaxed">Track performance, response times, and customer satisfaction metrics.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 px-6 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Automating Your Support Today</h2>
            <p className="text-xl text-gray-400 mb-10">Join teams already using Exora to reduce support costs and improve customer satisfaction.</p>
            
            <SeeHowItWorksButton className="mx-auto" />
          </div>
        </section>

        <footer className="border-t border-white/10 py-8 px-6 text-center text-gray-500 text-sm">
          <p>© 2024 <span className="footer-exora-brand">Exora</span>. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
