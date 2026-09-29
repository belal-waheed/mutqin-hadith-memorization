import { ImageResponse } from 'next/og'
 
export const runtime = 'nodejs'
export const size = { width: 512, height: 512 }
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #fefce8 0%, #eab308 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '22%',
          border: '12px solid #ca8a04',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
        }}
      >
        <div style={{ 
          fontSize: 240, 
          color: '#713f12', 
          fontWeight: '900',
          fontFamily: 'system-ui, sans-serif'
        }}>
          م
        </div>
      </div>
    ),
    { ...size }
  )
}
