import { SignIn } from '@clerk/nextjs'

const SigninPage = () => {
  return (
    <main className='flex h-screen w-full items-center justify-center'>
        <div className="h-full w-full bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex items-center justify-center">
        <SignIn/>
        </div>
    </main>
  )
}

export default SigninPage