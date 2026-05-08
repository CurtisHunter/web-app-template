import MainPage from "./pages/MainPage/MainPage";
import SignInPage from "./pages/SignInPage/SignInPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import ErrorPage from "./pages/ErrorPage/ErrorPage";

const routes = [
  {
    path: "/",
    element: <MainPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/users/sign-up",
    element: <SignUpPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/users/sign-in",
    element: <SignInPage />,
    errorElement: <ErrorPage />,
  },
];

export default routes;
