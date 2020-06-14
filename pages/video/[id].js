import { useRouter } from 'next/router'
import useSwr from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Video() {
  const router = useRouter()
  const { data, error } = useSwr(`/api/video/${router.query.id}`, fetcher)

  if (error) return <div>Failed to load video</div>
  if (!data) return <div>Loading...</div>

  return <div>{data.title}</div>
}