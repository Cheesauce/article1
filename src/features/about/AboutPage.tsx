
import React from 'react';
import './AboutPage.css';
import Icon from '../../components/Icon';

type Props = {
  onRead: () => void;
};

export default function AboutPage({ onRead }: Props) {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-eyebrow">
          <span className="about-dot" />
          <span>Public thesis journal</span>
        </div>
        <h1 className="about-title">
          Track the <em>Thesis.</em>
        </h1>
        <p className="about-lede">
          Every position stated plainly. Every receipt logged. We keep receipts —
          on money, markets, and long-horizon thinking.
        </p>
        <div className="about-cta-row">
          <button className="about-cta primary" onClick={onRead}>
            Start reading
            <Icon name="send" size={14} />
          </button>
          <a
            className="about-cta ghost"
            href="https://twitter.com/TracktheThesis"
            target="_blank"
            rel="noopener noreferrer"
          >
            @TracktheThesis
          </a>
        </div>
      </section>

      <section className="about-pillars">
        <article className="pillar">
          <div className="pillar-num">01</div>
          <h3>State the thesis.</h3>
          <p>
            Every post begins with the argument — why this, why now, why you.
            No hedges buried in footnotes. If the idea can't be said plainly,
            it isn't finished yet.
          </p>
        </article>
        <article className="pillar">
          <div className="pillar-num">02</div>
          <h3>Log the receipt.</h3>
          <p>
            Entry price. Position size. Horizon. Conviction score. The receipt
            is the discipline — it turns an opinion into a record you can be
            held to.
          </p>
        </article>
        <article className="pillar">
          <div className="pillar-num">03</div>
          <h3>Let time grade it.</h3>
          <p>
            We do not delete the misses. Markets reward preparation, not
            prediction, and the archive is the proof of work. Patience
            compounds.
          </p>
        </article>
      </section>

      <section className="about-manifesto">
        <h2>The house style.</h2>
        <p>
          A civilization that lowers its time preference builds cathedrals,
          libraries, and long-dated infrastructure. We write as if someone
          will read this in ten years — because someone will, and that someone
          is usually us.
        </p>
        <p>
          Every published note carries two headers: <strong>The Thesis</strong>{' '}
          and <strong>The Receipt</strong>. The thesis is the argument; the
          receipt is the commitment. Together they form a position you can
          defend — and, more importantly, one you can revisit honestly.
        </p>
        <blockquote>
          "The position, patiently held, compounds. Capital follows clarity."
        </blockquote>
      </section>

      <section className="about-close">
        <div className="about-close-inner">
          <h2>Read the archive.</h2>
          <p>Theses, updates, and receipts — chronologically honest.</p>
          <button className="about-cta primary large" onClick={onRead}>
            Open the feed
            <Icon name="send" size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}
