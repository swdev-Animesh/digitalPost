
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'

function App() {
  return (
    <>
    <div className="bg-slate-600 text-white p-4 mx-auto mt-10">
      <header className=" flex justify-center gap-4">
        <Show when="signed-out">
          <SignInButton mode="modal" className="cursor-pointer border-b-2 border-transparent transition-all duration-800 hover:border-current "/>
          <SignUpButton mode="modal" className="cursor-pointer group relative py-1 transition-all duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full"/>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
      </div>
    </>
  )
}

export default App