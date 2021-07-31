import { Login, Logout, auth } from "../../lib/firebase";

const IndexPage = () => (
  <>
    <h1>Hello Next.js 👋</h1>
    <div>
      <button onClick={() => Login()}>ログイン</button>
      <button onClick={() => Logout()}>ログアウト</button>
    </div>
    <div>
      <pre>
        {auth.currentUser
          ? auth.currentUser.displayName + "でログインしています"
          : "ログインしていません"}
      </pre>
    </div>
  </>
);

export default IndexPage;