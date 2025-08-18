type Props = {
  title?: string;
  items: string[];
};

export default function MainContent({ title = 'Whishlist', items }: Props) {
  return (
    <main className="main">
      <h1 className="mainTitle">{title}</h1>
      <ul className="list">
        {items.map(name => (
          <li key={name} className="itemRow">
            <span className="itemName">{name}</span>
            <button className="giftBtn" onClick={() => { /* позже добавим действие */ }}>
              подарю
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
