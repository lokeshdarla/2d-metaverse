import { useOkto, type OktoContextType, type User } from 'okto-sdk-react'
import { useEffect } from 'react';


const App = () => {
  const { getUserDetails } = useOkto() as OktoContextType;
  useEffect(() => {
    getUserDetails().then((result) => {
      console.log(result);
    }).catch((error) => {
      console.error(error);
    })
  }, [])
  return (
    <div>App</div>
  )
}

export default App
