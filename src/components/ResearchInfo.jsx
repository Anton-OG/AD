import React from 'react';
import '../components/styles/ResearchInfo.css';
import t3 from '../assets/t3.jpeg';

export default function ResearchInfo({ onNext }) {
  return (
    <section className="info-block fade-in">
      <h1 className="info-title">About This Research Study</h1>

      {/* две колонки: слева текст, справа картинка */}
      <div className="info-grid">
        <div className="info-text">
          <p>
            This test is part of a research study that explores how people understand
            images and everyday situations. We are especially interested in how this
            relates to memory and thinking abilities.
          </p>
          <p>
            This test is part of a research study exploring how people interpret images
            and everyday situations. We are especially interested in how this relates to
            memory and cognitive abilities. Our goal is to discover new ways to support
            the early detection of conditions like Alzheimer’s disease. The information
            you provide may help us train artificial intelligence (AI) tools to better
            understand early changes in brain function. All responses are anonymous and
            used solely for research purposes.
          </p>
        </div>

        <div className="info-media">
          <img src={t3} alt="Research study" />
        </div>
      </div>

      {/* кнопка снизу по центру */}
      <div className="info-actions">
        <button className="info-button" onClick={onNext}>Start the test</button>
      </div>
    </section>
  );
}
