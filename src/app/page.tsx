'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SparkBackground from './components/SparkBackground';
import styles from './page.module.css';
import { useLanguage } from './LanguageContext';

const GALLERY_IMAGES = [
  '20260523_115630(1).jpg.jpeg',
  '20260523_115633(1).jpg.jpeg',
  '20260523_115643(1).jpg.jpeg',
  '20260523_115701(1).jpg.jpeg',
  '20260523_115705(1).jpg.jpeg',
  '20260523_115817(1).jpg.jpeg',
  '20260523_115825(1).jpg.jpeg',
  '20260523_115827(1).jpg.jpeg',
  '20260523_115836.jpg.jpeg',
  '20260523_115852(1).jpg.jpeg',
  '20260523_120001(1).jpg.jpeg',
  '20260523_120051.jpg.jpeg',
  '20260523_120054.jpg.jpeg',
  '20260523_120123(1).jpg.jpeg',
  '20260523_120133(1)(1).jpg.jpeg',
  '20260523_120133(1).jpg.jpeg',
  '20260523_120136(1).jpg.jpeg',
  '20260523_120312(1).jpg.jpeg',
  '20260523_120322(1).jpg.jpeg',
  '20260523_120324(1).jpg.jpeg',
  '20260523_120330(1).jpg.jpeg'
];

export default function Home() {
  const { t } = useLanguage();
  
  const [isBookCallOpen, setIsBookCallOpen] = useState(false);
  const [isCallSuccess, setIsCallSuccess] = useState(false);
  const [callFormData, setCallFormData] = useState({ name: '', mobile: '', description: '' });

  const [currentSlideshowIndex, setCurrentSlideshowIndex] = useState(0);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideshowIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleBookCallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCallSuccess(true);
    setTimeout(() => {
      setIsBookCallOpen(false);
      setIsCallSuccess(false);
      setCallFormData({ name: '', mobile: '', description: '' });
    }, 2000);
  };


  return (
    <div className={styles.main}>
      <Navbar />
      
      <section className={styles.hero}>
        <SparkBackground />
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{t('heroTitle')}</h1>
          <p className={styles.subtitle}>{t('heroSubtitle')}</p>
          <button className="btn-primary">{t('contact')}</button>
        </div>
      </section>

      <section id="collections" className={styles.collectionsSection}>
        <h2 className={styles.sectionTitle}>{t('collections')}</h2>
        <div className={styles.collectionsGrid}>
          <div className={`${styles.card} animate-float`} style={{ animationDelay: '0s' }}>
            <div className={styles.cardImageWrapper}>
              <img src="/images/tanks/petrol_tank.png" alt={t('petrolTanks')} className={styles.cardImage} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{t('petrolTanks')}</h3>
            </div>
          </div>
          <div className={`${styles.card} animate-float`} style={{ animationDelay: '0.2s' }}>
            <div className={styles.cardImageWrapper}>
              <img src="/images/tanks/water_tank.png" alt={t('waterTanks')} className={styles.cardImage} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{t('waterTanks')}</h3>
            </div>
          </div>
          <div className={`${styles.card} animate-float`} style={{ animationDelay: '0.4s' }}>
            <div className={styles.cardImageWrapper}>
              <img src="/images/tanks/milk_tank.png" alt={t('milkTanks')} className={styles.cardImage} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{t('milkTanks')}</h3>
            </div>
          </div>
          <div className={`${styles.card} animate-float`} style={{ animationDelay: '0.6s' }}>
            <div className={styles.cardImageWrapper}>
              <img src="/images/tanks/oil_tank.png" alt={t('oilTanks')} className={styles.cardImage} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{t('oilTanks')}</h3>
            </div>
          </div>
          <div className={`${styles.card} animate-float`} style={{ animationDelay: '0.8s' }}>
            <div className={styles.cardImageWrapper}>
              <img src="/images/tanks/food_tank.png" alt={t('foodGradeTanks')} className={styles.cardImage} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{t('foodGradeTanks')}</h3>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.lorrySection}>
        <div className={styles.truckWrapper}>
          {/* Truck Underglow */}
          <div className={styles.underglow}></div>

          {/* Truck Cab */}
          <div className={styles.cab}>
            {/* Windshield Reflection */}
            <div className={styles.cabWindow}>
              <div className={styles.windowReflection}></div>
            </div>
            
            {/* Futuristic LED Headlight Bar */}
            <div className={styles.frontLed}></div>
            
            {/* Active Headlight Beam */}
            <div className={styles.headlightBeam}></div>
            
            {/* Chrome Exhaust Pipe with Active Smoke Particles */}
            <div className={styles.exhaustStack}>
              <div className={styles.exhaustSmoke}>
                <span className={styles.smokeParticle}></span>
                <span className={styles.smokeParticle}></span>
                <span className={styles.smokeParticle}></span>
              </div>
            </div>

            {/* Cab Wheel with Spinning Rims */}
            <div className={`${styles.wheel} ${styles.cabWheel}`}>
              <div className={styles.wheelRim}>
                <div className={styles.hubNut}></div>
                <div className={styles.rimSpoke} style={{transform: 'rotate(0deg)'}}></div>
                <div className={styles.rimSpoke} style={{transform: 'rotate(45deg)'}}></div>
                <div className={styles.rimSpoke} style={{transform: 'rotate(90deg)'}}></div>
                <div className={styles.rimSpoke} style={{transform: 'rotate(135deg)'}}></div>
              </div>
            </div>
          </div>
          
          {/* Heavy coupling Steel Connector */}
          <div className={styles.connector}>
            <div className={styles.connectorCable}></div>
          </div>

          {/* Truck Tanker with Welded Details */}
          <div className={styles.tanker}>
            {/* Metal Straps */}
            <div className={styles.tankerStrap} style={{ left: '20%' }}></div>
            <div className={styles.tankerStrap} style={{ left: '50%' }}></div>
            <div className={styles.tankerStrap} style={{ left: '80%' }}></div>
            
            {/* Glowing Weld Seam representing Sri Balamurugan's Welding expertise */}
            <div className={styles.weldedSeam}></div>
            <div className={styles.weldSparkShower}>
              <span className={styles.weldSpark}></span>
              <span className={styles.weldSpark}></span>
              <span className={styles.weldSpark}></span>
            </div>

            {/* Industrial Dial Gauge */}
            <div className={styles.pressureGauge}>
              <div className={styles.gaugeFace}>
                <div className={styles.gaugeIndicator}></div>
              </div>
            </div>

            <div className={styles.buttonSlot}>
              <button className="btn-primary" onClick={() => setIsBookCallOpen(true)}>{t('bookCall')}</button>
            </div>

            {/* Tanker Wheel 1 */}
            <div className={`${styles.wheel} ${styles.tankerWheel1}`}>
              <div className={styles.wheelRim}>
                <div className={styles.hubNut}></div>
                <div className={styles.rimSpoke} style={{transform: 'rotate(0deg)'}}></div>
                <div className={styles.rimSpoke} style={{transform: 'rotate(45deg)'}}></div>
                <div className={styles.rimSpoke} style={{transform: 'rotate(90deg)'}}></div>
                <div className={styles.rimSpoke} style={{transform: 'rotate(135deg)'}}></div>
              </div>
            </div>

            {/* Tanker Wheel 2 */}
            <div className={`${styles.wheel} ${styles.tankerWheel2}`}>
              <div className={styles.wheelRim}>
                <div className={styles.hubNut}></div>
                <div className={styles.rimSpoke} style={{transform: 'rotate(0deg)'}}></div>
                <div className={styles.rimSpoke} style={{transform: 'rotate(45deg)'}}></div>
                <div className={styles.rimSpoke} style={{transform: 'rotate(90deg)'}}></div>
                <div className={styles.rimSpoke} style={{transform: 'rotate(135deg)'}}></div>
              </div>
            </div>
            
            {/* Tail Light */}
            <div className={styles.tailLight}></div>
          </div>
        </div>
      </section>

      {/* Gallery Showcase Section */}
      <section id="gallery" className={styles.gallerySection}>
        <div className={styles.galleryContainer}>
          <div className={styles.galleryHeader}>
            <h2 className={styles.galleryTitle}>{t('slideshowTitle')}</h2>
            <p className={styles.gallerySubtitle}>{t('slideshowSubtitle')}</p>
          </div>

          {/* Hero Slideshow */}
          <div className={styles.heroSlideshow}>
            <div className={styles.slideshowImageWrapper}>
              <img 
                src={`/images/gallery/${GALLERY_IMAGES[currentSlideshowIndex]}`} 
                alt={`Slideshow ${currentSlideshowIndex}`} 
                className={styles.slideshowImage}
                onClick={() => setActiveLightboxIndex(currentSlideshowIndex)}
              />
              <div className={styles.slideshowBadge}>
                {currentSlideshowIndex + 1} / {GALLERY_IMAGES.length}
              </div>
            </div>

            {/* Manual Controls */}
            <button 
              className={`${styles.navBtn} ${styles.prevBtn}`} 
              onClick={() => setCurrentSlideshowIndex((prev) => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length)}
              aria-label={t('prevImage')}
            >
              &#10094;
            </button>
            <button 
              className={`${styles.navBtn} ${styles.nextBtn}`} 
              onClick={() => setCurrentSlideshowIndex((prev) => (prev + 1) % GALLERY_IMAGES.length)}
              aria-label={t('nextImage')}
            >
              &#10095;
            </button>

            {/* Slide Indicators / Dots */}
            <div className={styles.slideshowDots}>
              {GALLERY_IMAGES.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`${styles.slideshowDot} ${idx === currentSlideshowIndex ? styles.activeDot : ''}`}
                  onClick={() => setCurrentSlideshowIndex(idx)}
                ></span>
              ))}
            </div>
          </div>


        </div>
      </section>

      <section id="contact" className={styles.contactSection}>
        <h2>{t('contact')}</h2>
        
        <div className={styles.mapContainer}>
          <iframe 
            src="https://maps.google.com/maps?q=11.2561624,78.1590199&z=16&output=embed" 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Location Map"
          ></iframe>
        </div>

        <div className={styles.addressBlock}>
          <strong>{t('addressLabel')}:</strong><br/>
          {t('addressText')}<br/><br/>
          <strong>Email:</strong> info@sribalamurugan.com<br/>
          <strong>Phone:</strong> +91 98765 43210
        </div>
      </section>

      {/* Book a Call Modal */}
      {isBookCallOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalBody}>
              {/* Left Column: Premium Light-Themed Animated Lorry */}
              <div className={styles.modalLorryColumn}>
                <div className={styles.blueprintTitle}>SRI BALAMURUGAN / CHASSIS LAYOUT</div>
                <div className={styles.blueprintSpec}>TYPE: WELDED TANKER<br />SCALE: 1:25</div>
                
                <div className={styles.lightTruckWrapper}>
                  {/* Truck Underglow */}
                  <div className={styles.lightUnderglow}></div>

                  {/* Truck Cab */}
                  <div className={styles.lightCab}>
                    {/* Windshield Reflection */}
                    <div className={styles.lightCabWindow}>
                      <div className={styles.lightWindowReflection}></div>
                    </div>
                    
                    {/* Futuristic LED Headlight Bar */}
                    <div className={styles.lightFrontLed}></div>
                    
                    {/* Active Headlight Beam */}
                    <div className={styles.lightHeadlightBeam}></div>
                    
                    {/* Chrome Exhaust Pipe with Active Smoke Particles */}
                    <div className={styles.lightExhaustStack}>
                      <div className={styles.lightExhaustSmoke}>
                        <span className={styles.lightSmokeParticle}></span>
                        <span className={styles.lightSmokeParticle}></span>
                        <span className={styles.lightSmokeParticle}></span>
                      </div>
                    </div>

                    {/* Cab Wheel with Spinning Rims */}
                    <div className={`${styles.lightWheel} ${styles.lightCabWheel}`}>
                      <div className={styles.lightWheelRim}>
                        <div className={styles.lightHubNut}></div>
                        <div className={styles.lightRimSpoke} style={{ transform: 'rotate(0deg)' }}></div>
                        <div className={styles.lightRimSpoke} style={{ transform: 'rotate(45deg)' }}></div>
                        <div className={styles.lightRimSpoke} style={{ transform: 'rotate(90deg)' }}></div>
                        <div className={styles.lightRimSpoke} style={{ transform: 'rotate(135deg)' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Heavy coupling Steel Connector */}
                  <div className={styles.lightConnector}>
                    <div className={styles.lightConnectorCable}></div>
                  </div>

                  {/* Truck Tanker with Welded Details */}
                  <div className={styles.lightTanker}>
                    {/* Metal Straps */}
                    <div className={styles.lightTankerStrap} style={{ left: '20%' }}></div>
                    <div className={styles.lightTankerStrap} style={{ left: '50%' }}></div>
                    <div className={styles.lightTankerStrap} style={{ left: '80%' }}></div>
                    
                    {/* Glowing Weld Seam */}
                    <div className={styles.lightWeldedSeam}></div>
                    <div className={styles.lightWeldSparkShower}>
                      <span className={styles.lightWeldSpark}></span>
                      <span className={styles.lightWeldSpark}></span>
                      <span className={styles.lightWeldSpark}></span>
                    </div>

                    {/* Industrial Dial Gauge */}
                    <div className={styles.lightPressureGauge}>
                      <div className={styles.lightGaugeFace}>
                        <div className={styles.lightGaugeIndicator}></div>
                      </div>
                    </div>

                    {/* Tanker Wheel 1 */}
                    <div className={`${styles.lightWheel} ${styles.lightTankerWheel1}`}>
                      <div className={styles.lightWheelRim}>
                        <div className={styles.lightHubNut}></div>
                        <div className={styles.lightRimSpoke} style={{ transform: 'rotate(0deg)' }}></div>
                        <div className={styles.lightRimSpoke} style={{ transform: 'rotate(45deg)' }}></div>
                        <div className={styles.lightRimSpoke} style={{ transform: 'rotate(90deg)' }}></div>
                        <div className={styles.lightRimSpoke} style={{ transform: 'rotate(135deg)' }}></div>
                      </div>
                    </div>

                    {/* Tanker Wheel 2 */}
                    <div className={`${styles.lightWheel} ${styles.lightTankerWheel2}`}>
                      <div className={styles.lightWheelRim}>
                        <div className={styles.lightHubNut}></div>
                        <div className={styles.lightRimSpoke} style={{ transform: 'rotate(0deg)' }}></div>
                        <div className={styles.lightRimSpoke} style={{ transform: 'rotate(45deg)' }}></div>
                        <div className={styles.lightRimSpoke} style={{ transform: 'rotate(90deg)' }}></div>
                        <div className={styles.lightRimSpoke} style={{ transform: 'rotate(135deg)' }}></div>
                      </div>
                    </div>
                    
                    {/* Tail Light */}
                    <div className={styles.lightTailLight}></div>
                  </div>
                </div>

                <div className={styles.blueprintScale}>REF: WORKSHOP-PLOT // Namakkal</div>
              </div>

              {/* Right Column: Book a Call Form */}
              <div className={styles.modalFormColumn}>
                <div className={styles.modalHeader}>
                  <h2>{t('bookCall')}</h2>
                  <button className={styles.closeBtn} onClick={() => setIsBookCallOpen(false)}>&times;</button>
                </div>
                
                {isCallSuccess ? (
                  <p className={styles.successMessage}>{t('bookCallSuccess')}</p>
                ) : (
                  <form onSubmit={handleBookCallSubmit}>
                    <div className={styles.formGroup}>
                      <label>{t('name')}</label>
                      <input 
                        type="text" 
                        className={styles.input} 
                        value={callFormData.name}
                        onChange={e => setCallFormData({ ...callFormData, name: e.target.value })}
                        required 
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>{t('mobileNumber')}</label>
                      <input 
                        type="tel" 
                        className={styles.input} 
                        value={callFormData.mobile}
                        onChange={e => setCallFormData({ ...callFormData, mobile: e.target.value })}
                        required 
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>{t('description')}</label>
                      <textarea 
                        className={`${styles.input} ${styles.textarea}`} 
                        value={callFormData.description}
                        onChange={e => setCallFormData({ ...callFormData, description: e.target.value })}
                        required 
                      ></textarea>
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                      {t('submit')}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {activeLightboxIndex !== null && (
        <div className={styles.lightboxOverlay} onClick={() => setActiveLightboxIndex(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={() => setActiveLightboxIndex(null)}>
              &times;
            </button>
            
            <div className={styles.lightboxMain}>
              <img 
                src={`/images/gallery/${GALLERY_IMAGES[activeLightboxIndex]}`} 
                alt={`Project ${activeLightboxIndex}`} 
                className={styles.lightboxImage} 
              />
            </div>

            {/* Lightbox Navigation */}
            <button 
              className={`${styles.lightboxArrow} ${styles.lightboxPrev}`}
              onClick={() => setActiveLightboxIndex((prev) => (prev !== null ? (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length : null))}
              aria-label={t('prevImage')}
            >
              &#10094;
            </button>
            <button 
              className={`${styles.lightboxArrow} ${styles.lightboxNext}`}
              onClick={() => setActiveLightboxIndex((prev) => (prev !== null ? (prev + 1) % GALLERY_IMAGES.length : null))}
              aria-label={t('nextImage')}
            >
              &#10095;
            </button>

            {/* Lightbox Status */}
            <div className={styles.lightboxBadge}>
              {activeLightboxIndex + 1} / {GALLERY_IMAGES.length}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
