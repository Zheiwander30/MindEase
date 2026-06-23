export default function Card({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag
      className={`rounded-2xl bg-app-card p-4 shadow-card border border-app-border ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
