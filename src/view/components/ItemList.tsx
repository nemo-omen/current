import { FC } from "hono/jsx";
import { ItemCard } from "./ItemCard";

export const ItemList: FC = (props) => {
  const {items} = props;
  return (
    <ul class="card-list dashboard-items-list">
      {items.map((item) => (<ItemCard item={item} />))}
    </ul>
  );
};

