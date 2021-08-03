import { GetServerSideProps } from 'next'
import { getServerSideProps as _getServerSideProps } from 'next-fortress/build/inspect'
import { withSSRContext } from 'aws-amplify'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { Auth } = withSSRContext(ctx)
  try {
    const user = await Auth.currentAuthenticatedUser()
    console.log(!!user)
  } catch (e) {
    console.log(false)
  }

  return await _getServerSideProps(ctx)
}

const Inspect = () => null

export default Inspect
