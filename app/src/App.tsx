
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import Root from "./pages/root"
import { HomePage } from "./pages/home/HomePage"
import { MemberPage } from "./pages/member/MemberPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Navigate to="/HomePage" replace />
      },
      {
        path: "/HomePage",
        element: <HomePage />
      },
      {
        path: "MemberPage",
        element: < MemberPage />
      }
    ]
  }
]);

function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  )
}

export default App