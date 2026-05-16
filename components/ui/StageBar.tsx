export default function StageBar({ stage, size = 'md' }: { stage: number; size?: 'sm' | 'md' }) {
  const h = size === 'sm' ? 4 : 6
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: size === 'sm' ? 2 : 3 }}>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} style={{
          height: h,
          borderRadius: h / 2,
          background: i < stage ? '#C9A84C' : i === stage - 1 ? '#E2C47A' : '#1A1A1A',
          boxShadow: i === stage - 1 ? '0 0 6px rgba(201,168,76,0.4)' : 'none',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  )
}
