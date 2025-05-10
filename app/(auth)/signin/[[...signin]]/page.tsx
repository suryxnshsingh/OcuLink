import { SignIn } from '@clerk/nextjs'
import NeoBrutalismBackground from '@/components/ui/NeoBrutalismBackground'

const SigninPage = () => {
  return (
    <NeoBrutalismBackground>
      <SignIn />
    </NeoBrutalismBackground>
  )
}

export default SigninPage

