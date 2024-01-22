import { Context } from "hono";
import { Hono } from "hono";
import { NoteList } from "../view/pages/notes/NoteList";

const app = new Hono();

app.get('/', (c: Context) => {
  c.set('pageTitle', 'Your Notes');
  c.set('notes', []);
  return NoteList(c);
});

export default app;