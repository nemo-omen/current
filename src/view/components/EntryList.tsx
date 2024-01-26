import { FC } from "hono/jsx";
import { EntryCard } from "./EntryCard";

export const EntryList: FC = async (props) => {
  const {entries} = props;
  return (
    <ul class="card-list dashboard-items-list">
      {entries.map((entry) => (<EntryCard entry={entry} />))}
    </ul>
  );
};

