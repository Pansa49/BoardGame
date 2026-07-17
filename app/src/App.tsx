
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"


const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/homePage" replace />
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