import React from 'react';
import { useTranslation } from 'react-i18next';
import '../components/styles/ResearchInfo.css';
import t3 from '../assets/t3.jpeg';

export default function ResearchInfo({ onNext }) {
  const { i18n, t } = useTranslation();
  return (
    <section className="info-block fade-in">
      <h1 className="info-title">{t('info_title')}</h1>

      <div className="info-grid">
        <div className="info-text">
         <p>{t('info_p1')}</p>
         <p>{t('info_p2')}</p>
        </div>

        <div className="info-media">
          <img src={t3} alt={t('info_image_alt')} />
        </div>
      </div>

      
      <div className="info-actions">
        <button className="info-button" onClick={onNext}>{t('info_cta')}</button>
      </div>
    </section>
  );
}
