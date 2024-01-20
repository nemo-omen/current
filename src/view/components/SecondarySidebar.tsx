import { FC } from "hono/jsx";
import { useRequestContext } from "hono/jsx-renderer";

export const SecondarySidebar: FC = (props) => {
  return (
    <aside class="sidebar sidebar-secondary">
      <h2>Secondary Sidebar</h2>
    </aside>
  )
}
