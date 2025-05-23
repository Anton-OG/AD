import React from 'react';
import '../components/styles/ResearchInfo.css';
import t3 from '../assets/t3.jpeg';

export default function ResearchInfo({ onNext }) {
  return (
    <div className="info-block fade-in">
      <h1>About This Research Study</h1>
      <p className="info-paragraph">
        This test is part of a research study that explores how people understand images and everyday situations.
        We are especially interested in how this relates to memory and thinking abilities.
      </p>
      <p className="info-paragraph">
        This test is part of a research study exploring how people interpret images and everyday situations.
         We are especially interested in how this relates to memory and cognitive abilities.
        Our goal is to discover new ways to support the early detection of conditions like Alzheimer’s disease. 
        The information you provide may help us train artificial intelligence (AI) tools to better understand early changes in brain function.
         All responses are anonymous and used solely for research purposes.
      </p>
      <img src={t3} alt="Research study" className="info-image" />
      <div className="info-button-container">
        <button onClick={onNext} className="info-button">Start the test</button>
      </div>
    </div>
  );
}