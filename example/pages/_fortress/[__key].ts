import { getServerSideProps as _getServerSideProps } from 'next-fortress/build/inspect'
import { GetServerSideProps } from 'next'
import {FC} from "react";
import firebase from "firebase/app"
import nookies from "nookies"
import {verifyIdToken} from "../../lib/firebaseAdmin";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = nookies.get(ctx)
  const aa = await verifyIdToken(cookies['firebaseIdToken'])
  console.log(cookies)
  console.log(aa)
  return _getServerSideProps(ctx)
}

const Inspect: FC = () => null

export default Inspect
