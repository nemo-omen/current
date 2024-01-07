import { Context, Hono } from 'hono';
import { validator } from 'hono/validator';
import { z } from 'zod';
import { Login } from './view/Login';
import { Signup } from './view/Signup';
import { AuthResult, getUserByEmail, insertUser, authenticateUser, userExists } from './user.service';
import { FlashMessage } from '../common/interfaces/FlashMessage';

const app = new Hono();

/* VALIDATION SCHEMA */
const loginFormSchema = z.object({
  email: z.string().email("No valid email provided."),
  password: z.string().min(6, "Must be at least 6 characters.")
});

const signupFormSchema = z.object({
  email: z.string().email("No valid email provided."),
  password: z.string().min(6, "Must be at least 6 characters."),
  confirm: z.string()
}).superRefine(({ confirm, password }, ctx) => {
  if (confirm !== password) {
    ctx.addIssue({
      code: 'custom',
      message: 'Passwords do not match.'
    });
  }
});

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData {
  email: string;
  password: string;
  confirm: string;
}

/* ROUTES */
app.get('/login', (c: Context) => Login(c));
app.get('/signup', (c: Context) => Signup(c));

app.post(
  '/login',
  validator('form', (value, c) => {
    const session = c.get('session');
    const result = loginFormSchema.safeParse(value);
    if (!result.success) {
      const issues = result.error.issues;
      const issuePaths = issues.map((issue) => issue.path[0]);
      const issueMessages = issues.map((issue) => issue.message);
      for (let i = 0; i < issuePaths.length; i++) {
        session.flash(`${issuePaths[i]}Error`, issueMessages[i]);
      }
      return c.redirect('/auth/login');
    }
    return result.data;
  }),
  async (c: Context) => {
    const session = c.get('session');
    const data: LoginFormData = c.req.valid('form');
    const exists = userExists(data.email);
    if (!exists) {
      session.flash('emailError', 'No account with that email exists.');
      return c.redirect('/auth/login');
    }

    const { email, id, isAuthed } = await authenticateUser(data, c);
    if (!isAuthed) {
      session.flash('passwordError', 'That password is incorrect.');
      return c.redirect('/auth/login');
    }
    session.set('user', { id: id, email: email });
    return c.redirect('/home');
  }
);

app.post(
  '/signup',
  validator('form', (value, c) => {
    const result = signupFormSchema.safeParse(value);
    const session = c.get('session');
    if (!result.success) {
      const issues = result.error.issues;
      const issuePaths = issues.map((issue) => issue.path[0]);
      const issueMessages = issues.map((issue) => issue.message);
      for (let i = 0; i < issuePaths.length; i++) {
        session.flash(`${issuePaths[i]}Error`, issueMessages[i]);
      }
    }
    return result.data;
  }),
  async (c: Context) => {
    const data: SignupFormData = c.req.valid('form');
    const session = c.get('session');
    const exists = userExists(data.email);
    const userdata = { email: data.email, password: data.password };
    if (!exists) {
      const insertResult = await insertUser(userdata);
      // confirmation email???
      session.flash('message', 'Success! Log in to get started.');
      return c.redirect('/auth/login');
    }
    // need to get id from insert result?
    // Attempt to create user
    //  - Check db for email
    //    - reject if exists
    //    - persist if not
    //  - Redirect to login
    // -- flash email confirm message
    session.flash('error', 'A user with that email already exists.');
    return c.redirect('/auth/login');
  }
);

/**
 * Initiate email verification.
 * For users who want to recieve
 */
// app.post('/verify', (c: Context) => {
// // email verification token generation
// });

// app.post('/verify/:token', (c: Context) => {
//   // validate token
//   // update user's email validation state
// })

app.post('/logout', (c: Context) => {
  const session = c.get('session');
  session.deleteSession();
  console.log(session);
  console.log(session.getCache());
  return c.redirect('/auth/login');
});
export default app;