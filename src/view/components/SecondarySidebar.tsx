import { FC } from "hono/jsx";
import { useRequestContext } from "hono/jsx-renderer";

export const SecondarySidebar: FC = (props) => {
  const c = useRequestContext();

  return (
    <aside class="sidebar sidebar-secondary">
      {/*  */}
    </aside>
  )
}
