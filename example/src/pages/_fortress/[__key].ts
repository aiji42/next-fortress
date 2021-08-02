import {GetServerSideProps} from "next";
import { getServerSideProps as _getServerSideProps } from 'next-fortress/build/inspect'
import { withSSRContext } from 'aws-amplify'
import Amplify from 'aws-amplify'

Amplify.configure({
  Auth: {
    region: 'ap-northeast-1',
    userPoolId: 'ap-northeast-1_P5mu03yaS',
    userPoolWebClientId : process.env.COGNITO_CLIENT_ID
  },
  ssr: true
})

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { Auth } = withSSRContext(ctx)
  // console.log(Auth.Credentials)
  Auth.currentAuthenticatedUser().then(console.log).catch(console.log)
  return await _getServerSideProps(ctx)
}

const Inspect = () => null

export default Inspect
