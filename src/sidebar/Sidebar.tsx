import Button from "../components/Button";

export default function Sidebar() {
  return (
    <div
      className="sidebar"
      style={{ width: "260px", flexShrink: 0, height: "100vh" }}
    >
      <h2>Recipe helper</h2>
      <section>
        <Button onClick={() => {}} label="Your fridge" />
        <br />
        <Button onClick={() => {}} label="New conversation" />
      </section>
      <section>
        <h3>Recent creations</h3>
        <ul>
          <li>Peanut butter and jelly sandwich</li>
          <li>Grilled cheese sandwich</li>
          <li>Spaghetti with marinara sauce</li>
        </ul>
      </section>
    </div>
  );
}
