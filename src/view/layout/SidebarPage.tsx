import { Context } from "hono";
import { Header } from "../components/Header";
import { MainSidebar } from "../components/MainSidebar";
import { SecondarySidebar } from "../components/SecondarySidebar";
import { useRequestContext } from "hono/jsx-renderer";

export const SidebarPage = ({children}) => {
  const c: Context = useRequestContext();
  return (
    <>
    <MainSidebar />
    <main>
      {children}
    </main>
    <SecondarySidebar />
    </>
  )
}