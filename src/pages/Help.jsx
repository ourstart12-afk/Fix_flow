import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';

const FAQS = [
  {
    q: 'How do I find my request ID?',
    a: 'Your request ID (e.g. REQ-1042) is shown immediately after you submit a repair request. You can also find it on the Track a request page under your recent activity.',
  },
  {
    q: 'How do I track my repair?',
    a: 'Go to the Track a request page and either search by your request ID or select your request from the list. The status timeline shows exactly where your device is in the repair process.',
  },
  {
    q: 'What happens if I enter a wrong request ID?',
    a: 'The search will return a "not found" message. Double-check the ID format (e.g. REQ-1042) and try again. If you have lost your ID, check the Track page — your requests are listed there.',
  },
  {
    q: 'How is the repair status updated?',
    a: 'The facility manager updates the status as your device moves through each stage — from Submitted to Received, Under Inspection, In Repair, Ready for Collection, and finally Completed.',
  },
  {
    q: 'How do I submit a new repair request?',
    a: 'Click New repair in the sidebar or on the dashboard. Fill in your device details and describe the problem. You will receive a request ID straight away.',
  },
  {
    q: 'How long does a repair take?',
    a: 'It depends on the problem. Each request shows an estimated completion date once a technician has assessed the device. You can check the latest estimate on the request details page.',
  },
  {
    q: 'Can I register my device to speed up future requests?',
    a: 'Yes. Go to My devices and add your device once. When you submit a future repair request, your device details are already on file, so you fill in less information each time.',
  },
  {
    q: 'Who do I contact if I have an urgent question?',
    a: 'Use the contact number provided by your facility or visit the front desk. For digital support, your request details page shows the assigned technician name.',
  },
];

function Help() {
  const [openIdx, setOpenIdx] = useState(null);

  function toggle(i) {
    setOpenIdx(openIdx === i ? null : i);
  }

  return (
    <div className="help-page">
      <PageHeader
        eyebrow="SUPPORT"
        title="Help & FAQ"
        description="Everything you need to know about submitting, tracking, and managing your device repairs."
        action={<Link className="button" to="/new-repair"><LifeBuoy size={15} /> Submit a repair</Link>}
      />

      <div className="panel help-faq">
        <div className="help-faq__header">
          <h2>Frequently asked questions</h2>
          <p>Can't find what you're looking for? Visit the front desk or submit a repair request and a technician will be in touch.</p>
        </div>

        <ul className="faq-list">
          {FAQS.map((faq, i) => (
            <li key={i} className={`faq-item${openIdx === i ? ' faq-item--open' : ''}`}>
              <button
                type="button"
                className="faq-item__question"
                onClick={() => toggle(i)}
                aria-expanded={openIdx === i}
              >
                <span>{faq.q}</span>
                {openIdx === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openIdx === i && (
                <div className="faq-item__answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="help-links">
        <Link className="button" to="/new-repair">New repair request <ArrowRight size={15} /></Link>
        <Link className="button button--secondary" to="/track">Track a request <ArrowRight size={15} /></Link>
      </div>
    </div>
  );
}

export default Help;
