import { Context } from 'hono';
import { Base } from '../../lib/layout/Base';

export const Login = (c: Context) => {
  const session = c.get('session');
  const passwordError = session.get('passwordError') || '';
  const emailError = session.get('emailError') || '';
  return (
    c.render(
      <main style="grid-row: span 3;">
        <div class="auth-form">
          <h2>Log In</h2>
          <form action="/auth/login" method="POST">
            <fieldset>
              <label for="email">Email {emailError && <span class="flash error">{emailError}</span>}</label>
              <input type="email" name="email" id="email" />
            </fieldset>
            <fieldset>
              <label for="password">Password {passwordError && <span class="flash error">{passwordError}</span>}</label>
              <input type="password" name="password" id="password" />
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