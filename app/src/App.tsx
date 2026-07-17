
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import { HomePage } from "./pages/home/homePage"
import Root from "./pages/root"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Navigate to="/homePage" replace />
      },
      {
        path: "/homePage",
        element: <HomePage />,
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