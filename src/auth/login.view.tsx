export function loginView() {
  return(
  <form action="/login" method="post">
    <fieldset>
    <label for="username">Username</label>
    <input type="text" name="username" id="username" />
    </fieldset>
    <fieldset>
    <label for="password">Password</label>
    <input type="password" name="password" id="password" />
    </fieldset>
    <button type="submit">Send That Shit!</button>
  </form>);
}
