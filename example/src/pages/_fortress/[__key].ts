import { Inspector } from 'next-fortress/build/inspector'
import { controller } from 'next-fortress/build/controller'
import { GetServerSideProps } from 'next'
import { ip } from 'next-fortress/build/ip'
import { firebase } from 'next-fortress/build/firebase'
import { cognito } from 'next-fortress/build/cognito'
const inspector = new Inspector().add(ip).add(firebase).add(cognito)
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return controller(inspector, ctx)
}
const Fortress = () => null
export default Fortress
