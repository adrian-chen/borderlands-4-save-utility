import './AdSidebar.css';

interface AdSidebarProps {
  position: 'left' | 'right';
}

/**
 * AdSidebar component for displaying advertisements
 *
 * To integrate Google AdSense:
 * 1. Sign up at https://www.google.com/adsense
 * 2. Create an ad unit (recommended: 160x600 Wide Skyscraper or 300x250 Medium Rectangle)
 * 3. Copy the ad code from AdSense dashboard
 * 4. Replace the placeholder div below with your AdSense code
 *
 * Example AdSense code structure:
 * <ins className="adsbygoogle"
 *      style={{ display: 'inline-block', width: '160px', height: '600px' }}
 *      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
 *      data-ad-slot="XXXXXXXXXX">
 * </ins>
 */
function AdSidebar({ position }: AdSidebarProps) {
  return (
    <aside className={`ad-sidebar ad-sidebar-${position}`}>
      {/* Replace this placeholder with your AdSense code */}
      <div className="ad-placeholder">
        <p>Ad Space</p>
        <p className="ad-size">160×600</p>
        <small>Replace with AdSense code</small>
      </div>
    </aside>
  );
}

export default AdSidebar;
