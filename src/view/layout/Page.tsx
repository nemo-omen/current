import { Context } from "hono";
import { Header } from "../components/Header";
import { MainSidebar } from "../components/MainSidebar";
import { useRequestContext } from "hono/jsx-renderer";

export const Page = ({children}) => {
  const c: Context = useRequestContext();
  return (
    <>
    <MainSidebar />
    <main>
      {children}
    </main>
    </>
  )
}