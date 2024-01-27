import { Context } from "hono";

export const Signup = (c: Context) => {
  const session = c.get('session');
  let signupEmail: string | null = null;
  let passwordError: string | null = null;
  let confirmationError: string | null = null;
  let emailError: string | null = null;

  if(session) {
    signupEmail = session.get('signupEmail');
    passwordError = session.get('passwordError');
    confirmationError = session.get('undefinedError');
    emailError = session.get('emailError');
  }

  return c.render(
  <main style="grid-row: span 3;">
    <div class="auth-form">
      <h2>Sign Up</h2>
      <form action="/auth/signup" method="POST">
        <fieldset>
          <label for="email">Email</label>
          <input type="email" name="email" id="email" value={signupEmail || ''} />
          <span class="flash form-flash error">{emailError}</span>
        </fieldset>
        <fieldset>
          <label for="password">Password</label>
          <input type="password" name="password" id="password" />
          <span class="flash form-flash error">{passwordError}</span>
        </fieldset>
        <fieldset>
          <label for="confirm">Confirm Password</label>
          <input type="password" name="confirm" id="confirm" />
          <span class="flash form-flash error">{confirmationError}</span>
        </fieldset>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  </main>,
    {
      title: 'Sign Up'
    }
    )
  }
