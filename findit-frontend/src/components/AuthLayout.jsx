export default function AuthLayout({ title, subtitle, children }) {
  return (
    <section className="auth">
      <div className="side">
        <p className="eyebrow">Lost and Found Management System</p>
        <h1>Find<span>It</span></h1>
        <p className="lead">
          Report what you lost or found, and help every item get back to its owner.
        </p>
      </div>
      <div className="pane">
        <div className="box">
          <h2>{title}</h2>
          <p className="sub">{subtitle}</p>
          {children}
        </div>
      </div>
    </section>
  );
}