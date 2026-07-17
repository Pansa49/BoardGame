
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import { HomePage } from "./pages/home/homePage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/homePage" replace />
  },
  {
    path: "/homePage",
    element: <HomePage />,
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