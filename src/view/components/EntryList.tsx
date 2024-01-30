import { FC } from "hono/jsx";
import { EntryCard } from "./EntryCard";

export const EntryList: FC = async ({entries}) => {
  return (
    <ul class="card-list dashboard-items-list">
      {entries.length > 0 ? entries.map((entry) => (<EntryCard entry={entry} />)) : null}
    </ul>
  );
};

