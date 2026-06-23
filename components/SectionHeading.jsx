export default function SectionHeading({ title, subtitle }) {
  return (
    <div className="sectionHeading">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}
