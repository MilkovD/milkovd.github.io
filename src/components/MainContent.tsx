type WishItem = {
  title: string;
  url?: string;
  description?: string;
  price?: string; // например: "65 000 ₽"
};

type Props = { title?: string; items: WishItem[] };

export default function MainContent({ title = 'Wishlist', items }: Props) {
  return (
    <main className="main">
      <h1 className="mainTitle">{title}</h1>

      <ul className="items">
        {items.map((it) => (
          <li key={it.title} className="item">
            <div className="itemBody">
              {it.url ? (
                <a className="itemTitle" href={it.url} target="_blank" rel="noreferrer">
                  {it.title}
                </a>
              ) : (
                <span className="itemTitle">{it.title}</span>
              )}
              {it.description && <p className="itemDesc">{it.description}</p>}
            </div>

            <div className="itemSide">
              {it.price && <div className="price">{it.price} ₽</div>}
              {/* <button className="giftBtn" aria-label={`Подарю: ${it.title}`}>подарю</button> */}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
