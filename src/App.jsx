import { Outlet } from "react-router-dom";
import axios from "./routers/axios"
import { useEffect } from "react"


function App() {

  useEffect(() => {
    const fetchHelloWorld = async () => {
      const res = await axios.get(`/api`);
      console.log(">>> check res: ", res)
    }
    fetchHelloWorld();
  }, [])

  return (
    <>
      {/* <Header /> */}
      <Outlet />
      {/* <Footer /> */}
    </>
  )
}

export default App
