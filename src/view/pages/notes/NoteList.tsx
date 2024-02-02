import { Context } from 'hono'
import { SidebarPage } from '../../layout/SidebarPage';


export const NoteList = (c: Context) => {
  const notes = c.get('notes');
  const pageTitle = c.get('pageTitle');
  
  return c.render(
    <SidebarPage>
      <></>
    </SidebarPage>,
    {title: pageTitle}
  )
};


