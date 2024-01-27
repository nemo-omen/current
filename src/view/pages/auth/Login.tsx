import { Context } from 'hono';
import { Base } from '../../lib/layout/Base';

export const Login = (c: Context) => {
  const session = c.get('session');

  let passwordError: string | null = null;
  let emailError: string | null = null;
  let loginEmail: string | null = null;

  if(session) {
    passwordError = session.get('passwordError');
    emailError = session.get('emailError');
    loginEmail = session.get('loginEmail');
  }
  return (
    c.render(
      <main style="grid-row: span 3;">
        <div class="auth-form">
          <h2>Log In</h2>
          <form action="/auth/login" method="POST">
            <fieldset>
              <label for="email">Email</label>
              <input type="email" name="email" id="email" value={loginEmail || ''}/>
              <span class="flash error">{emailError}</span>
            </fieldset>
            <fieldset>
              <label for="password">Password</label>
              <input type="password" name="password" id="password" />
              <span class="flash error">{passwordError}</span>
            </fieldset>
            <button type="submit">Login</button>
          </form>
        </div>
      </main>,
        {
          title: 'Login'
        }
    )
  )
}