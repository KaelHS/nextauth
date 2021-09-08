import { GetServerSideProps } from "next";
import { useState, FormEvent, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { parseCookies } from 'nookies';
import { withSSRguest } from '../utils/withSSRguest'; 

export default function Home() {

  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');

  const { singIn } = useContext(AuthContext);


  async function handleSubmit( event: FormEvent) {
    event.preventDefault();

    const data = {
      email,
      password,
    }

    await singIn(data)
  }

  return(
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={ ({target}) => setEmail(target.value)}/>
      <input type="password" value={password} onChange={ ({target}) => setPassword(target.value)}/>
      <button type="submit">Entrar</button>
    </form>
  );
}


export const getServerSideProps = withSSRguest(async (ctx) => {

  return {
    props:{}
  }
});
