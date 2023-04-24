import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '@/features/userSlice'



export default function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loginUser({ username: 'kminchelle', password: '0lelplR' }))
  }, [])
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1>Login</h1>
      </main>
    </>
  )
}
