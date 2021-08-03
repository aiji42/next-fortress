import { GetServerSideProps } from 'next'
import { getServerSideProps as _getServerSideProps } from 'next-fortress/build/inspect'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await _getServerSideProps(ctx)
}

const Inspect = () => null

export default Inspect
