import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

/**
 * Dynamic OG Image Generator
 * Generates beautiful, brand-consistent images for social media previews.
 * URL Params: title, subtitle, label, image
 */
export default async function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Dynamic parameters
    const title = searchParams.get('title') || 'Apna Coding';
    const subtitle = searchParams.get('subtitle') || "India's Premier Web3 Opportunity Layer";
    const label = searchParams.get('label') || 'OPPORTUNITY';
    // const bgImage = searchParams.get('image'); // Can be used for background if needed

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            backgroundImage: 'radial-gradient(circle at 25% 25%, #1a1a1a 0%, #000 100%)',
            padding: '40px 80px',
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Background Accents */}
          <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(0, 255, 255, 0.08)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255, 0, 255, 0.08)', filter: 'blur(60px)' }} />

          {/* Decorative Border */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              bottom: '20px',
              border: '2px solid rgba(0, 255, 255, 0.1)',
              borderRadius: '32px',
              pointerEvents: 'none',
            }}
          />

          {/* Content Box */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '60px',
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
            }}
          >
            {/* Label / Category */}
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#00ffff',
                textTransform: 'uppercase',
                letterSpacing: '6px',
                marginBottom: '30px',
                background: 'rgba(0, 255, 255, 0.1)',
                padding: '8px 20px',
                borderRadius: '8px',
              }}
            >
              {label}
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: title.length > 30 ? '60px' : '80px',
                fontWeight: 'bold',
                color: '#fff',
                marginBottom: '24px',
                lineHeight: 1.1,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                maxWidth: '900px',
              }}
            >
              {title}
            </div>

            {/* Subtitle / Description */}
            <div
              style={{
                fontSize: '32px',
                color: '#aaa',
                maxWidth: '850px',
                marginBottom: '40px',
                lineHeight: 1.4,
              }}
            >
              {subtitle.length > 150 ? subtitle.substring(0, 150) + '...' : subtitle}
            </div>

            {/* Brand Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: 'auto',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '30px',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              <img
                src="https://apnacoding.com/logo.png"
                width="50"
                height="50"
                style={{ marginRight: '16px', borderRadius: '50%' }}
              />
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#fff', letterSpacing: '-1px' }}>
                Apna Coding
              </div>
              <div style={{ fontSize: '24px', color: '#666', marginLeft: '12px' }}>
                apnacoding.com
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e.message);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
