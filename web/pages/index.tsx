import { GetServerSideProps } from "next"

interface HomeProps {
  count: number
}

export default function Home(props: HomeProps) {

  return (
    <div>
      <h1>Contagem: {props.count}</h1>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const response = await fetch('http://localhost:3333/pools/count')
  const data = await response.json()

  return {
    props: {
      count: data.count
    }
  }
}